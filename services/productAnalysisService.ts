// services/productAnalysisService.ts
interface ProductIdentifiers {
    possibleNames: string[];
    brandName?: string;
    modelNumber?: string;
    category: string;
    confidence: number;
    searchQueries: string[];  // Ranked list of search queries to try
    debugInfo: {
      detectedText: string[];
      logoResults: string[];
      labels: string[];
      objects: string[];
      colors: string[];
    };
  }
  
  export class ProductAnalysisService {
    private visionApiKey: string;
    private visionApiEndpoint = 'https://vision.googleapis.com/v1/images:annotate';
  
    constructor(visionApiKey: string) {
      this.visionApiKey = visionApiKey;
    }
  
    async analyzeProduct(imageUri: string): Promise<ProductIdentifiers> {
      try {
        // Get raw vision API results
        const visionResults = await this.getVisionAnalysis(imageUri);
        
        // Extract all possible identifiers
        const textResults = this.extractText(visionResults);
        const logoResults = this.extractLogos(visionResults);
        const labelResults = this.extractLabels(visionResults);
        const objectResults = this.extractObjects(visionResults);
        const colorResults = this.extractColors(visionResults);
  
        // Find potential brand names
        const brandName = this.identifyBrand(logoResults, textResults);
  
        // Look for model numbers in text
        const modelNumber = this.findModelNumber(textResults);
  
        // Determine product category
        const category = this.determineCategory(labelResults, objectResults);
  
        // Generate possible product names
        const possibleNames = this.generatePossibleNames(
          brandName,
          modelNumber,
          category,
          textResults,
          labelResults
        );
  
        // Generate search queries
        const searchQueries = this.generateSearchQueries(
          brandName,
          modelNumber,
          category,
          possibleNames,
          colorResults
        );
  
        // Calculate confidence
        const confidence = this.calculateConfidence(
          brandName,
          modelNumber,
          category,
          textResults,
          logoResults
        );
  
        return {
          possibleNames,
          brandName,
          modelNumber,
          category,
          confidence,
          searchQueries,
          debugInfo: {
            detectedText: textResults,
            logoResults,
            labels: labelResults,
            objects: objectResults,
            colors: colorResults
          }
        };
      } catch (error) {
        console.error('Error analyzing product:', error);
        throw error;
      }
    }
  
    private async getVisionAnalysis(imageUri: string) {
      const base64Image = await this.getBase64Image(imageUri);
      
      const response = await fetch(`${this.visionApiEndpoint}?key=${this.visionApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [
              { type: 'TEXT_DETECTION' },
              { type: 'LOGO_DETECTION' },
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
              { type: 'IMAGE_PROPERTIES' }
            ]
          }]
        })
      });
  
      return await response.json();
    }
  
    private async getBase64Image(imageUri: string): Promise<string> {
      // Implementation depends on your environment (Expo, React Native, etc.)
      // For Expo:
      return await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  
    private extractText(visionResults: any): string[] {
      const textAnnotations = visionResults.responses?.[0]?.textAnnotations || [];
      if (textAnnotations.length === 0) return [];
  
      // The first annotation contains all text, subsequent ones are individual words
      return textAnnotations.slice(1).map((annotation: any) => annotation.description);
    }
  
    private extractLogos(visionResults: any): string[] {
      return (visionResults.responses?.[0]?.logoAnnotations || [])
        .map((logo: any) => logo.description);
    }
  
    private extractLabels(visionResults: any): string[] {
      return (visionResults.responses?.[0]?.labelAnnotations || [])
        .map((label: any) => label.description);
    }
  
    private extractObjects(visionResults: any): string[] {
      return (visionResults.responses?.[0]?.localizedObjectAnnotations || [])
        .map((obj: any) => obj.name);
    }
  
    private extractColors(visionResults: any): string[] {
      const properties = visionResults.responses?.[0]?.imagePropertiesAnnotation;
      if (!properties?.dominantColors?.colors) return [];
  
      return properties.dominantColors.colors
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)
        .map((color: any) => this.rgbToColorName(color.color));
    }
  
    private identifyBrand(logos: string[], textTokens: string[]): string | undefined {
      // First, check for logos as they're most reliable
      if (logos.length > 0) {
        return logos[0]; // Most confident logo detection
      }
  
      // Common brand patterns in text
      const brandPatterns = [
        /^[A-Z][a-zA-Z]*$/, // Single capitalized word
        /^[A-Z][a-zA-Z]+ & [A-Z][a-zA-Z]+$/, // Brand & Brand format
        /^[A-Z][A-Z]+$/ // All caps brand names
      ];
  
      // Look for brand patterns in text
      const possibleBrands = textTokens.filter(token => 
        brandPatterns.some(pattern => pattern.test(token))
      );
  
      return possibleBrands[0];
    }
  
    private findModelNumber(textTokens: string[]): string | undefined {
      // Common model number patterns
      const modelPatterns = [
        /^[A-Z0-9]{2,}[-]?[A-Z0-9]{2,}$/, // Basic alphanumeric
        /^[A-Z]{1,3}[-]?[0-9]{3,}[A-Z]?$/, // Letter-number combination
        /^(model|type|ref)[:\s]([A-Z0-9-]+)/i // Explicit model reference
      ];
  
      const modelNumbers = textTokens.filter(token =>
        modelPatterns.some(pattern => pattern.test(token))
      );
  
      return modelNumbers[0];
    }
  
    private determineCategory(labels: string[], objects: string[]): string {
      // Combine and prioritize object detection over labels
      const candidates = [...objects, ...labels];
      
      // Common product categories (expand as needed)
      const categories = {
        electronics: ['phone', 'smartphone', 'laptop', 'computer', 'tablet', 'camera'],
        clothing: ['shirt', 'pants', 'dress', 'shoe', 'jacket'],
        furniture: ['chair', 'table', 'desk', 'sofa', 'bed'],
        appliances: ['refrigerator', 'washer', 'dryer', 'dishwasher']
      };
  
      // Find the first matching category
      for (const [category, keywords] of Object.entries(categories)) {
        if (candidates.some(c => keywords.some(k => c.toLowerCase().includes(k)))) {
          return category;
        }
      }
  
      return 'general';
    }
  
    private generatePossibleNames(
      brandName?: string,
      modelNumber?: string,
      category?: string,
      textTokens: string[] = [],
      labels: string[] = []
    ): string[] {
      const names = new Set<string>();
  
      // Combine brand and model
      if (brandName && modelNumber) {
        names.add(`${brandName} ${modelNumber}`);
      }
  
      // Look for consecutive capitalized words
      let consecutiveWords = '';
      textTokens.forEach((token, index) => {
        if (/^[A-Z]/.test(token)) {
          consecutiveWords += (consecutiveWords ? ' ' : '') + token;
        } else if (consecutiveWords) {
          names.add(consecutiveWords);
          consecutiveWords = '';
        }
      });
  
      // Add category-specific patterns
      if (category === 'electronics' && brandName) {
        const techWords = labels.filter(l => 
          ['phone', 'smartphone', 'laptop', 'tablet'].includes(l.toLowerCase())
        );
        techWords.forEach(word => names.add(`${brandName} ${word}`));
      }
  
      return Array.from(names);
    }
  
    private generateSearchQueries(
      brandName?: string,
      modelNumber?: string,
      category?: string,
      possibleNames: string[] = [],
      colors: string[] = []
    ): string[] {
      const queries = new Set<string>();
  
      // Add possible names first
      possibleNames.forEach(name => queries.add(name));
  
      // Brand + Model
      if (brandName && modelNumber) {
        queries.add(`${brandName} ${modelNumber}`);
      }
  
      // Brand + Category + Color
      if (brandName && category && colors.length > 0) {
        queries.add(`${brandName} ${category} ${colors[0]}`);
      }
  
      // Brand + Category
      if (brandName && category) {
        queries.add(`${brandName} ${category}`);
      }
  
      return Array.from(queries);
    }
  
    private calculateConfidence(
      brandName?: string,
      modelNumber?: string,
      category?: string,
      textTokens: string[] = [],
      logos: string[] = []
    ): number {
      let confidence = 0;
  
      // Brand detection confidence
      if (logos.length > 0) confidence += 0.4;
      else if (brandName) confidence += 0.2;
  
      // Model number confidence
      if (modelNumber) confidence += 0.3;
  
      // Category confidence
      if (category && category !== 'general') confidence += 0.2;
  
      // Text detection confidence
      if (textTokens.length > 0) confidence += 0.1;
  
      return Math.min(confidence, 1);
    }
  
    private rgbToColorName(color: { red: number; green: number; blue: number }): string {
      // Simplified color naming logic
      const { red, green, blue } = color;
      const sum = red + green + blue;
      const max = Math.max(red, green, blue);
  
      if (sum < 150) return 'black';
      if (sum > 650) return 'white';
      if (max === red) return 'red';
      if (max === green) return 'green';
      if (max === blue) return 'blue';
      return 'gray';
    }
  }