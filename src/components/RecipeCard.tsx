// src/components/RecipeCard.tsx
// Recipe card component for the home screen grid

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { UtensilsCrossed, Clock, Users } from 'lucide-react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '../styles/theme';
import { decodeHtmlEntities } from '../utils/textUtils';

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  onPress,
  onLongPress,
}: RecipeCardProps) {
  const colors = useColors();
  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <Pressable
      onPress={() => onPress(id)}
      onLongPress={onLongPress ? () => onLongPress(id) : undefined}
      delayLongPress={500}
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
            <UtensilsCrossed size={32} color={colors.textSecondary} strokeWidth={1.5} />
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
          {decodeHtmlEntities(title)}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          {totalTime > 0 && (
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {totalTime}m
              </Text>
            </View>
          )}
          {servings && (
            <View style={styles.metaItem}>
              <Users size={14} color={colors.textSecondary} strokeWidth={1.5} />
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
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
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
  content: {
    padding: spacing.sm,
    // Fixed height for consistent cards: title (2 lines) + meta row + spacing
    height: 88,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.body,
    lineHeight: typography.sizes.body * typography.lineHeights.body,
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
  metaText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
});
