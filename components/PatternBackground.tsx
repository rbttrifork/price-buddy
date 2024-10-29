// components/PatternBackground.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

export function PatternBackground() {
  // Create multiple elements for the pattern
  const elements = Array(6).fill(0);
  
  return (
    <View style={styles.container}>
      {/* Geometric elements */}
      {elements.map((_, index) => (
        <Animated.View 
          key={index}
          style={[
            styles.element,
            {
              top: `${(index * 20) + Math.random() * 20}%`,
              left: `${(index * 20) + Math.random() * 20}%`,
              transform: [
                { rotate: `${index * 45}deg` },
                { scale: 0.5 + Math.random() * 0.5 }
              ],
            }
          ]}
        />
      ))}

      {/* Circular elements */}
      {elements.map((_, index) => (
        <Animated.View 
          key={`circle-${index}`}
          style={[
            styles.circle,
            {
              top: `${(index * 15) + Math.random() * 30}%`,
              right: `${(index * 15) + Math.random() * 30}%`,
              width: 20 + Math.random() * 40,
              height: 20 + Math.random() * 40,
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  element: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    opacity: 0.1,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 999,
    opacity: 0.1,
  },
});