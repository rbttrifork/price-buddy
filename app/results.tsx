import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Button, Divider, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // Dummy data for prototype
  const priceComparisons = [
    { store: 'Amazon', price: '$29.99', delivery: '2-day shipping' },
    { store: 'Walmart', price: '$32.99', delivery: 'In store' },
    { store: 'Target', price: '$34.99', delivery: 'Same day delivery' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0f2027', '#203a43']} // Dark teal to match home screen
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Information */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text variant="headlineSmall" style={styles.productName}>
            {params.name as string}
          </Text>
          
          {params.image && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: params.image as string }} 
                style={styles.productImage} 
              />
            </View>
          )}
          
          {params.confidence && (
            <Chip 
              icon="check" 
              style={styles.confidenceChip}
            >
              Match Confidence: {Math.round(parseFloat(params.confidence as string) * 100)}%
            </Chip>
          )}
          
          {params.description && (
            <Text style={styles.description}>
              {params.description as string}
            </Text>
          )}
        </Animated.View>

        {/* Price Comparisons */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Price Comparison
          </Text>

          {loading ? (
            <ActivityIndicator style={styles.loader} color="#fff" />
          ) : (
            <View style={styles.priceList}>
              {priceComparisons.map((item, index) => (
                <View key={index} style={styles.priceItem}>
                  <View style={styles.priceHeader}>
                    <Text variant="titleMedium" style={styles.storeName}>
                      {item.store}
                    </Text>
                    <Text variant="headlineSmall" style={styles.price}>
                      {item.price}
                    </Text>
                  </View>
                  
                  <Text style={styles.deliveryInfo}>
                    {item.delivery}
                  </Text>
                  
                  <Button
                    mode="outlined"
                    onPress={() => {}}
                    style={styles.viewButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    textColor="#ffffff"
                    icon="arrow-right"  // Added an icon
                  >
                    View Deal
                  </Button>
                  
                  {index < priceComparisons.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Action Button */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.buttonContainer}
        >
          <Button
            mode="contained"
            onPress={() => router.push('/camera')}
            style={styles.scanButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="camera"
          >
            Scan Another Product
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f2027',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
  },
  productName: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  imageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  confidenceChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  description: {
    color: '#ffffff',
    opacity: 0.8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
  },
  priceList: {
    gap: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    color: '#ffffff',
    flex: 1,
  },
  price: {
    color: '#ffffff',
    fontWeight: '700',
  },
  deliveryInfo: {
    color: '#ffffff',
    opacity: 0.7,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  buttonContainer: {
    padding: 16,
    paddingTop: 8,
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  loader: {
    padding: 20,
  },
  priceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  viewButton: {
    marginTop: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
    flexDirection: 'row-reverse', // Puts icon on the right
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
});