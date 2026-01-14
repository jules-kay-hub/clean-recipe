// src/components/RecipeCard.tsx
// Recipe card component for the home screen grid

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '../styles/theme';

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  onPress: (id: string) => void;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  onPress,
}: RecipeCardProps) {
  const colors = useColors();
  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadows.md,
      ]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.placeholderEmoji]}>🍽️</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          {totalTime > 0 && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaIcon]}>⏱</Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {totalTime} min
              </Text>
            </View>
          )}
          {servings && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaIcon]}>👤</Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {servings}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.sectionHeader,
    lineHeight: typography.sizes.sectionHeader * typography.lineHeights.sectionHeader,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
});
