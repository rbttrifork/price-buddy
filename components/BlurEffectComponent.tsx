// components/BlurredBackground.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { PatternBackground } from './PatternBackground';

export function BlurredBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <PatternBackground />
      <BlurView 
        intensity={20} 
        style={StyleSheet.absoluteFill}
        tint="dark"
      />
    </View>
  );
}