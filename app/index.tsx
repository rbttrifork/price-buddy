// app/index.tsx
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PatternBackground } from '../components/PatternBackground';
import { BlurredBackground } from '@/components/BlurEffectComponent';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      step: '01',
      title: 'Point & Scan',
      description: 'Snap a photo of any product',
    },
    {
      step: '02',
      title: 'Compare Prices',
      description: 'See prices from multiple stores',
    },
    {
      step: '03',
      title: 'Save Money',
      description: 'Find the best available deals',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43']}
        style={styles.gradient}
      >
        <BlurredBackground />

        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <Text variant="displaySmall" style={styles.title}>
            PriceLens
          </Text>
          <Text variant="headlineSmall" style={styles.subtitle}>
            Your Smart Shopping Assistant
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.featuresContainer}
        >
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={[
                styles.featureItem,
                index === features.length - 1 && styles.lastFeature
              ]}
            >
              <View style={styles.stepIndicator}>
                <Text style={styles.stepNumber}>{feature.step}</Text>
                {index !== features.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.featureContent}>
                <Text variant="titleMedium" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.actionSection}
        >
          <Button
            mode="contained"
            onPress={() => router.push('/camera')}
            style={styles.mainButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            buttonColor="rgba(255, 255, 255, 0.2)"
            icon="camera"
          >
            Start Scanning
          </Button>
          
          <Text style={styles.helpText}>
            Point your camera at any product to get started
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 10,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  lastFeature: {
    marginBottom: 0,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stepLine: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#ffffff',
    opacity: 0.7,
  },
  actionSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 'auto',
  },
  mainButton: {
    width: width * 0.85,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  helpText: {
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
  },
});