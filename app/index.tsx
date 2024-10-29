import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PatternBackground } from '../components/PatternBackground';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const features = [
    {
      icon: '🔍',
      title: 'Instant Price Check',
      description: 'Compare prices across multiple stores in seconds'
    },
    {
      icon: '📸',
      title: 'Just Take a Photo',
      description: 'No typing needed - let AI do the work'
    },
    {
      icon: '💰',
      title: 'Save Money',
      description: 'Find the best deals instantly'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        // More sophisticated, professional gradient
        colors={['#0f2027', '#203a43']}
        style={styles.gradient}
      >
        <PatternBackground />

        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <Text variant="displaySmall" style={styles.title}>
            Price Buddy
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
            <View key={index} style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text 
                  variant="titleMedium" 
                  style={styles.featureTitle}
                >
                  {feature.title}
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={styles.featureDescription}
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
        <ActionButton/>
      </LinearGradient>
    </SafeAreaView>
  );
}

const ActionButton = () => {
    const router = useRouter();
    
    return (
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
          icon="camera"  // Add camera icon
        >
          Start Scanning
        </Button>
        
        <Text style={styles.helpText}>
          Point your camera at any product to get started
        </Text>
      </Animated.View>
    );
  };

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
    paddingBottom: 20,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    backgroundColor: '#f5f5f5', // Light gray background for icons
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#1a1a1a', // Almost black for better contrast
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#666666', // Darker gray for better readability
    lineHeight: 20,
  },
  actionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainButton: {
    width: width * 0.85,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',  // White button
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 60,  // Taller button
    flexDirection: 'row-reverse', // Icon on the right
    gap: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',  // Match gradient color
    letterSpacing: 0.5,
  },
  helpText: {
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
  }
});