// src/screens/ExtractingScreen.tsx
// Loading screen shown during recipe extraction

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { UtensilsCrossed, AlertCircle } from 'lucide-react-native';
import { useColors } from '../hooks/useTheme';
import { spacing, typography, borderRadius } from '../styles/theme';
import { Button, Caption } from '../components/ui';

interface ExtractingScreenProps {
  url: string;
  onCancel: () => void;
  onRetry: () => void;
  error?: string;
}

const LOADING_MESSAGES = [
  'Fetching page',
  'Reading ingredients',
  'Parsing steps',
  'Processing',
  'Finishing',
];

export function ExtractingScreen({
  url,
  onCancel,
  onRetry,
  error,
}: ExtractingScreenProps) {
  const colors = useColors();
  const [messageIndex, setMessageIndex] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Rotate animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseValue]);

  // Cycle through messages
  useEffect(() => {
    if (error) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [error]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Extract domain from URL
  const getDomain = (urlString: string): string => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Error Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
            <AlertCircle size={48} color={colors.error} strokeWidth={1.5} />
          </View>

          {/* Error Message */}
          <Text style={[styles.title, { color: colors.text }]}>
            Extraction Failed
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {error}
          </Text>

          {/* URL */}
          <View style={[styles.urlBadge, { backgroundColor: colors.surface }]}>
            <Caption numberOfLines={1}>{getDomain(url)}</Caption>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button onPress={onRetry} variant="accent">
              Try Again
            </Button>
            <Button onPress={onCancel} variant="ghost">
              Cancel
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Animated Spinner */}
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '20' },
            { transform: [{ scale: pulseValue }] },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <UtensilsCrossed size={48} color={colors.primary} strokeWidth={1.5} />
          </Animated.View>
        </Animated.View>

        {/* Status Message */}
        <Text style={[styles.title, { color: colors.text }]}>
          Extracting
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {LOADING_MESSAGES[messageIndex]}
        </Text>

        {/* URL Badge */}
        <View style={[styles.urlBadge, { backgroundColor: colors.surface }]}>
          <Caption numberOfLines={1}>{getDomain(url)}</Caption>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {LOADING_MESSAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === messageIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Cancel */}
        <Button onPress={onCancel} variant="ghost" style={styles.cancelButton}>
          Cancel
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  urlBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    maxWidth: '80%',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    gap: spacing.md,
    width: '100%',
    maxWidth: 200,
  },
  cancelButton: {
    marginTop: spacing.lg,
  },
});
