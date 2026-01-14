// App.tsx
// Main entry point for CleanRecipe

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
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
  // Show setup instructions if Convex not configured
  if (!convex) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚙️</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 28,
  },
});
