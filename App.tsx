// App.tsx
// Main entry point for Julienned

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { ThemeProvider } from './src/hooks/useTheme';
import { RootNavigator } from './src/navigation';

// Initialize Convex client
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// Show error if Convex URL not configured
if (!convexUrl) {
  console.warn('EXPO_PUBLIC_CONVEX_URL not set. See .env.example');
}

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'Fraunces-Bold': Fraunces_700Bold,
  });

  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D4A3E" />
      </View>
    );
  }

  // Show setup instructions if Convex not configured
  if (!convex) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Setup Required</Text>
        <Text style={styles.text}>
          1. Run: npx convex dev{'\n'}
          2. Copy .env.example to .env{'\n'}
          3. Add your EXPO_PUBLIC_CONVEX_URL{'\n'}
          4. Restart the app
        </Text>
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 28,
  },
});
