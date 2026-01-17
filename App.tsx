// App.tsx
// Main entry point for Julienned with Clerk authentication

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
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
import { OfflineProvider } from './src/context/OfflineContext';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Clerk configuration
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Convex configuration
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

// Show warning if environment variables not configured
if (!clerkPublishableKey) {
  console.warn('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY not set. See .env.example');
}
if (!convexUrl) {
  console.warn('EXPO_PUBLIC_CONVEX_URL not set. See .env.example');
}

// Initialize Convex client
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// ═══════════════════════════════════════════════════════════════════════════
// SECURE TOKEN CACHE FOR CLERK
// ═══════════════════════════════════════════════════════════════════════════

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getToken error:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore saveToken error:', error);
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore clearToken error:', error);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

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

  // Show setup instructions if environment not configured
  if (!clerkPublishableKey || !convex) {
    const steps: string[] = [];
    if (!clerkPublishableKey) {
      steps.push('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local');
    }
    if (!convexUrl) {
      steps.push('Run: npx convex dev');
      steps.push('Add EXPO_PUBLIC_CONVEX_URL to .env.local');
    }
    steps.push('Restart the app');

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Setup Required</Text>
        <Text style={styles.text}>
          {steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider>
            <OfflineProvider>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </OfflineProvider>
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

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
