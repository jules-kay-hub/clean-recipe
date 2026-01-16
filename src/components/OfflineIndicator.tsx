// src/components/OfflineIndicator.tsx
// Animated banner showing offline status

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useOffline } from '../context/OfflineContext';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';

interface OfflineIndicatorProps {
  // Optional custom message
  message?: string;
}

export function OfflineIndicator({ message }: OfflineIndicatorProps) {
  const { isOnline } = useOffline();
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOnline, slideAnim, opacityAnim]);

  // Don't render anything when online (after animation completes)
  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={16} color={colors.textInverse} strokeWidth={2} />
        <Text style={[styles.text, { color: colors.textInverse }]}>
          {message || "You're offline. Viewing cached recipes."}
        </Text>
      </View>
    </Animated.View>
  );
}

// Compact version for inline use
export function OfflineBadge() {
  const { isOnline } = useOffline();
  const colors = useColors();

  if (isOnline) return null;

  return (
    <View style={[styles.badge, { backgroundColor: colors.warning }]}>
      <WifiOff size={12} color={colors.textInverse} strokeWidth={2} />
      <Text style={[styles.badgeText, { color: colors.textInverse }]}>
        Offline
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
