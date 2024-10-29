import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Price Checker
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Take a photo of any product to find the best prices
        </Text>
      </View>
      
      <FAB
        icon="camera"
        label="Scan Product"
        style={styles.fab}
        onPress={() => router.push({ pathname: '/camera' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});