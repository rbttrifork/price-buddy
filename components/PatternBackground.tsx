// components/PatternBackground.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';

export function PatternBackground() {
  const { width, height } = useWindowDimensions();
  const elements = Array(8).fill(0);

  const createAnimatedStyle = (index: number) => {
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
      // Slower vertical movement
      translateY.value = withRepeat(
        withTiming(30, {  // Reduced movement distance
          duration: 6000 + index * 1000, // Increased duration
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );

      // Slower rotation
      rotate.value = withRepeat(
        withTiming(360, {
          duration: 12000 + index * 1000, // Much slower rotation
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // More subtle scaling
      scale.value = withRepeat(
        withTiming(1.1, {  // Reduced scale range
          duration: 8000,  // Slower scaling
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, []);

    return useAnimatedStyle(() => {
      return {
        transform: [
          { translateY: translateY.value },
          { rotate: `${rotate.value}deg` },
          { scale: scale.value }
        ]
      };
    });
  };

  const getRandomPosition = (index: number) => {
    return {
      left: Math.random() * (width - 100),
      top: Math.random() * (height - 100),
    };
  };

  const getShape = (index: number) => {
    switch (index % 3) {
      case 0:
        return styles.circle;
      case 1:
        return styles.square;
      case 2:
        return styles.triangle;
      default:
        return styles.circle;
    }
  };

  return (
    <View style={styles.container}>
      {elements.map((_, index) => {
        const position = getRandomPosition(index);
        const shape = getShape(index);
        const animatedStyle = createAnimatedStyle(index);

        return (
          <Animated.View
            key={index}
            style={[
              styles.element,
              shape,
              position,
              animatedStyle,
            ]}
          />
        );
      })}
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
    width: 40,
    height: 40,
    backgroundColor: 'white',
    opacity: 0.06,  // Slightly reduced opacity
  },
  circle: {
    borderRadius: 20,
  },
  square: {
    borderRadius: 4,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
});