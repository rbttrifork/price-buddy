import * as FileSystem from 'expo-file-system';

interface ProductDetectionResult {
  name: string;
  description: string;
  labels: string[];
  confidence: number;
  brandName?: string;
  detectedText: string[];
  categories: string[];
  matchSource: 'brand' | 'text' | 'label' | 'object';
  debugInfo: {
    allDetectedText: string[];
    potentialBrands: string[];
    relevantObjects: string[];
    confidenceFactors: {
      factor: string;
      score: number;
      weight: number;
    }[];
  };
}

export class ProductDetectionService {
  private apiKey: string;
  private apiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';

  // Common product-related terms to help identify product descriptions
  private productIndicators = [
    'model', 'series', 'edition', 'version', 'pack', 'set', 'kit', 
    'collection', 'brand', 'type', 'style', 'size', 'color'
  ];

  // Common words to filter out from product names
  private filterWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by'
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectProduct(imageUri: string): Promise<ProductDetectionResult> {
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'LOGO_DETECTION', maxResults: 5 },
              { type: 'TEXT_DETECTION' },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
              { type: 'WEB_DETECTION', maxResults: 5 }, // Add web detection for better context
              { type: 'IMAGE_PROPERTIES' } // Can help identify product packaging
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze image');
      }

      return this.processApiResponse(data.responses[0]);
    } catch (error) {
      console.error('Error in product detection:', error);
      throw error;
    }
  }

  private processApiResponse(response: any): ProductDetectionResult {
    const labels = response.labelAnnotations?.map((label: any) => label.description) || [];
    const allDetectedText = response.textAnnotations?.[0]?.description.split('\n') || [];
    const logos = response.logoAnnotations?.map((logo: any) => logo.description) || [];
    const objects = response.localizedObjectAnnotations?.map((obj: any) => obj.name) || [];
    const webEntities = response.webDetection?.webEntities || [];

    // Process text to find potential product information
    const processedText = this.processDetectedText(allDetectedText);
    const potentialBrands = this.identifyPotentialBrands(logos, processedText.brandIndicators);
    
    // Analyze and categorize detected objects
    const relevantObjects = this.filterRelevantObjects(objects);
    
    // Determine the best product match using all available signals
    const productMatch = this.determineProductMatch(
      processedText,
      potentialBrands,
      relevantObjects,
      labels,
      webEntities
    );

    // Calculate confidence based on multiple factors
    const confidenceFactors = this.calculateConfidenceFactors(
      productMatch,
      processedText,
      potentialBrands,
      relevantObjects,
      webEntities
    );

    const overallConfidence = this.calculateOverallConfidence(confidenceFactors);

    return {
      name: productMatch.name,
      description: productMatch.description,
      labels: labels,
      confidence: overallConfidence,
      brandName: potentialBrands[0],
      detectedText: processedText.processedLines,
      categories: this.determineCategories(labels, objects, webEntities),
      matchSource: productMatch.source,
      debugInfo: {
        allDetectedText: allDetectedText,
        potentialBrands: potentialBrands,
        relevantObjects: relevantObjects,
        confidenceFactors: confidenceFactors
      }
    };
  }

  private processDetectedText(texts: string[]) {
    const processedLines = texts.map(text => text.trim())
      .filter(text => text.length > 0)
      .filter(text => !this.filterWords.includes(text.toLowerCase()));

    // Find potential brand indicators
    const brandIndicators = processedLines.filter(text => 
      text.match(/^[A-Z0-9][A-Za-z0-9\s\-\.]*$/) && // Typical brand pattern
      text.length > 2 &&
      text.length < 20
    );

    // Find potential model numbers
    const modelNumbers = processedLines.filter(text =>
      text.match(/^[A-Z0-9\-]{4,}$/) || // Traditional model numbers
      text.match(/^[A-Z]{1,4}[\-]?\d{3,}[A-Z]?$/) // Common product code format
    );

    return {
      processedLines,
      brandIndicators,
      modelNumbers
    };
  }

  private identifyPotentialBrands(logos: string[], brandIndicators: string[]): string[] {
    // Combine and deduplicate brands from logos and text
    const allPotentialBrands = [...new Set([...logos, ...brandIndicators])];
    
    // Filter and sort by likelihood of being a brand
    return allPotentialBrands
      .filter(brand => 
        brand.length > 1 && 
        !this.filterWords.includes(brand.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize detected logos
        if (logos.includes(a) && !logos.includes(b)) return -1;
        if (!logos.includes(a) && logos.includes(b)) return 1;
        return b.length - a.length;
      });
  }

  private filterRelevantObjects(objects: string[]): string[] {
    // Filter out common non-product objects
    const irrelevantObjects = ['Person', 'Human', 'Wall', 'Floor', 'Table'];
    return objects.filter(obj => !irrelevantObjects.includes(obj));
  }

  private determineProductMatch(
    processedText: { processedLines: string[], brandIndicators: string[], modelNumbers: string[] },
    potentialBrands: string[],
    relevantObjects: string[],
    labels: string[],
    webEntities: any[]
  ): { name: string; description: string; source: 'brand' | 'text' | 'label' | 'object' } {
    // Try to construct product name from brand + model number
    if (potentialBrands.length > 0 && processedText.modelNumbers.length > 0) {
      return {
        name: `${potentialBrands[0]} ${processedText.modelNumbers[0]}`,
        description: this.constructDescription(labels, relevantObjects),
        source: 'brand'
      };
    }

    // Look for product-like text patterns
    const productNameCandidate = processedText.processedLines.find(text => {
      const words = text.split(' ');
      return words.length >= 2 && // At least two words
        words.length <= 6 && // Not too long
        !text.includes('$') && // Not a price
        text.length > 3 && // Not too short
        text.length < 50 && // Not too long
        this.productIndicators.some(indicator => 
          text.toLowerCase().includes(indicator)
        );
    });

    if (productNameCandidate) {
      return {
        name: productNameCandidate,
        description: this.constructDescription(labels, relevantObjects),
        source: 'text'
      };
    }

    // Use web entities if available
    const webEntity = webEntities.find((entity: any) => entity.score > 0.5);
    if (webEntity) {
      return {
        name: webEntity.description,
        description: this.constructDescription(labels, relevantObjects),
        source: 'label'
      };
    }

    // Fallback to object detection
    if (relevantObjects.length > 0) {
      return {
        name: relevantObjects[0],
        description: this.constructDescription(labels, relevantObjects.slice(1)),
        source: 'object'
      };
    }

    // Last resort
    return {
      name: labels[0] || 'Unknown Product',
      description: this.constructDescription(labels.slice(1), relevantObjects),
      source: 'label'
    };
  }

  private constructDescription(labels: string[], objects: string[]): string {
    const elements = [...new Set([...labels, ...objects])];
    return elements
      .slice(0, 5)
      .filter(item => item.length > 0)
      .join(', ');
  }

  private calculateConfidenceFactors(
    productMatch: { name: string; source: 'brand' | 'text' | 'label' | 'object' },
    processedText: { processedLines: string[], brandIndicators: string[], modelNumbers: string[] },
    potentialBrands: string[],
    relevantObjects: string[],
    webEntities: any[]
  ) {
    const factors = [];

    // Brand detection confidence
    factors.push({
      factor: 'Brand Detection',
      score: potentialBrands.length > 0 ? 0.9 : 0.3,
      weight: 0.3
    });

    // Text quality confidence
    factors.push({
      factor: 'Text Quality',
      score: processedText.processedLines.length > 3 ? 0.8 : 0.4,
      weight: 0.2
    });

    // Model number confidence
    factors.push({
      factor: 'Model Number',
      score: processedText.modelNumbers.length > 0 ? 0.9 : 0.3,
      weight: 0.15
    });

    // Object detection confidence
    factors.push({
      factor: 'Object Detection',
      score: relevantObjects.length > 0 ? 0.7 : 0.3,
      weight: 0.2
    });

    // Web entity match confidence
    const hasStrongWebMatch = webEntities.some((entity: any) => entity.score > 0.7);
    factors.push({
      factor: 'Web Match',
      score: hasStrongWebMatch ? 0.8 : 0.4,
      weight: 0.15
    });

    return factors;
  }

  private calculateOverallConfidence(factors: { factor: string; score: number; weight: number }[]): number {
    const weightedSum = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    return weightedSum / totalWeight;
  }

  private determineCategories(labels: string[], objects: string[], webEntities: any[]): string[] {
    const allTerms = [
      ...labels,
      ...objects,
      ...webEntities.map((entity: any) => entity.description)
    ];

    // Filter and deduplicate categories
    return [...new Set(allTerms)]
      .filter(term => term.length > 0)
      .slice(0, 5); // Keep top 5 categories
  }
}