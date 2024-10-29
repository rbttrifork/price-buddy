// app/results.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Linking } from 'react-native';
import { Text, Card, Button, Divider, ActivityIndicator, Chip, Surface, IconButton, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PriceResult } from '../services/priceComparisonService';
import { ProductReviews } from '../services/reviewService';

export default function ResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState({ prices: true, reviews: true });
  const [prices, setPrices] = useState<PriceResult[]>([]);
  const [reviews, setReviews] = useState<ProductReviews | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [error, setError] = useState<string | null>(null);

  // Parse labels from params
  const labels = params.labels ? JSON.parse(params.labels as string) : [];

  const renderMatchInfo = () => (
    <Card style={styles.matchInfoCard}>
      <Card.Content>
        <View style={styles.matchHeaderRow}>
          <Text variant="titleMedium">Match Information</Text>
          <Chip 
            icon={parseFloat(params.confidence as string) > 0.7 ? "check-circle" : "alert-circle"}
            style={[
              styles.confidenceChip,
              {
                backgroundColor: parseFloat(params.confidence as string) > 0.7 
                  ? theme.colors.primaryContainer 
                  : theme.colors.errorContainer
              }
            ]}
          >
            {Math.round(parseFloat(params.confidence as string) * 100)}% Confidence
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.matchDetailsContainer}>
          <Text variant="bodyMedium" style={styles.matchDetailTitle}>Detected Labels:</Text>
          <View style={styles.labelsContainer}>
            {labels.map((label: string, index: number) => (
              <Chip 
                key={index}
                style={styles.labelChip}
                textStyle={{ fontSize: 12 }}
              >
                {label}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPriceComparison = () => (
    <Card style={styles.section}>
      <Card.Title 
        title="Price Comparison" 
        right={() => (
          <IconButton 
            icon="sort" 
            onPress={() => setSortBy(sortBy === 'price' ? 'rating' : 'price')} 
          />
        )}
      />
      <Card.Content>
        {loading.prices ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          prices
            .sort((a, b) => sortBy === 'price' ? a.price - b.price : 0)
            .map((item, index) => (
              <Surface key={index} style={styles.priceItem} elevation={1}>
                <View style={styles.priceHeader}>
                  <Text variant="titleMedium" style={styles.storeName}>{item.store}</Text>
                  <Text style={styles.price}>
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.deliveryInfo}>
                  <Chip 
                    icon="truck-delivery" 
                    style={[styles.infoChip, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    {item.delivery?.type} 
                    {item.delivery?.estimatedDays && ` (${item.delivery.estimatedDays} days)`}
                  </Chip>
                  {item.inStock ? (
                    <Chip 
                      icon="check" 
                      style={[styles.infoChip, { backgroundColor: theme.colors.secondaryContainer }]}
                    >
                      In Stock
                    </Chip>
                  ) : (
                    <Chip 
                      icon="close" 
                      style={[styles.infoChip, { backgroundColor: theme.colors.errorContainer }]}
                    >
                      Out of Stock
                    </Chip>
                  )}
                </View>
                <Button
                  mode="contained"
                  onPress={() => Linking.openURL(item.url)}
                  style={styles.viewButton}
                  labelStyle={styles.buttonLabel}
                >
                  View Deal
                </Button>
                {index < prices.length - 1 && <Divider style={styles.divider} />}
              </Surface>
            ))
        )}
      </Card.Content>
    </Card>
  );

  // ... rest of the component code remains the same ...

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.productCard}>
        <Card.Title title={params.name as string} />
        <Card.Content>
          {params.image && (
            <Image 
              source={{ uri: params.image as string }} 
              style={styles.productImage} 
            />
          )}
          {params.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {params.description as string}
            </Text>
          )}
        </Card.Content>
      </Card>

      {renderMatchInfo()}

      {error ? (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={() => router.push('/camera')}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          {renderPriceComparison()}
          {/* ... reviews section remains the same ... */}
        </>
      )}

      <Button
        mode="contained"
        style={styles.scanButton}
        labelStyle={styles.buttonLabel}
        onPress={() => router.push('/camera')}
      >
        Scan Another Product
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  productCard: {
    margin: 16,
    marginBottom: 8,
  },
  matchInfoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchDetailsContainer: {
    marginTop: 8,
  },
  matchDetailTitle: {
    marginBottom: 8,
    fontWeight: '500',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    marginBottom: 4,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  description: {
    marginTop: 8,
  },
  confidenceChip: {
    borderRadius: 16,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  loader: {
    padding: 20,
  },
  priceItem: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeName: {
    flex: 1,
    marginRight: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deliveryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    borderRadius: 16,
  },
  viewButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 2,
  },
  divider: {
    marginVertical: 16,
  },
  errorCard: {
    margin: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  scanButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
  },
});