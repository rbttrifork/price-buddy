// app/camera.tsx
import React, { useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { IconButton, Text, Portal, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ProductDetectionService } from '../services/productDetectionService';

// STORE ME IN ENV VARIABLES
const GOOGLE_CLOUD_API_KEY = 'AIzaSyCPdT3eqTbZlMtYdNkQ1EgJIVeTCG293hA';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // @ts-ignore
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();
  const productDetectionService = new ProductDetectionService(GOOGLE_CLOUD_API_KEY);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Take the picture with base64 encoding
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      // Detect product from image
      const productInfo = await productDetectionService.detectProduct(photo.uri);

      // Navigate to results with the detected product info
      router.push({
        pathname: '/results',
        params: {
          name: productInfo.name,
          description: productInfo.description,
          image: photo.uri,
          confidence: productInfo.confidence.toString(),
          labels: JSON.stringify(productInfo.labels)
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      // Show error to user
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}>
      <Text>No access to camera</Text>
    </View>;
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
      >
        <View style={styles.buttonContainer}>
          <IconButton
            icon="close"
            size={30}
            iconColor="white"
            style={styles.closeButton}
            onPress={() => router.back()}
          />
          <IconButton
            icon={isProcessing ? 'loading' : 'camera'}
            size={50}
            iconColor="white"
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          />
        </View>

        {/* Product frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>
            Position product within the frame
          </Text>
        </View>

        {isProcessing && (
          <Portal>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Analyzing product...</Text>
            </View>
          </Portal>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },
  hint: {
    color: 'white',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
  },
});