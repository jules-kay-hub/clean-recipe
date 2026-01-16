// src/components/RecipeCard.tsx
// Recipe card component for the home screen grid

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { UtensilsCrossed, Clock, Users, Moon, Timer } from 'lucide-react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '../styles/theme';
import { decodeHtmlEntities } from '../utils/textUtils';
import { formatDuration, detectOvernightChill, extractPassiveTime } from '../utils/dateUtils';

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  inactiveTime?: number;
  servings?: number;
  instructions?: string[];
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  prepTime,
  cookTime,
  inactiveTime,
  servings,
  instructions,
  onPress,
  onLongPress,
}: RecipeCardProps) {
  const colors = useColors();

  // Calculate times
  const activeTime = (prepTime || 0) + (cookTime || 0);
  // Use stored inactiveTime or extract from instructions as fallback
  const passiveTime = inactiveTime || extractPassiveTime(instructions);
  const totalTime = activeTime + passiveTime;

  // Format times for display
  const formattedActiveTime = formatDuration(activeTime);
  const formattedTotalTime = formatDuration(totalTime);
  const hasPassiveTime = passiveTime > 0;

  // Detect overnight requirement
  const isOvernightChill = passiveTime >= 480 || detectOvernightChill(instructions, prepTime, cookTime);

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
            contentFit="cover"
            cachePolicy="disk"
            transition={200}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <UtensilsCrossed size={32} color={colors.textSecondary} strokeWidth={1.5} />
          </View>
        )}

        {/* Overnight Chill Badge */}
        {isOvernightChill && (
          <View style={[styles.overnightBadge, { backgroundColor: colors.primary }]}>
            <Moon size={12} color={colors.textInverse} strokeWidth={2} />
            <Text style={[styles.overnightText, { color: colors.textInverse }]}>
              Overnight
            </Text>
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
          {formattedActiveTime && (
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {hasPassiveTime ? formattedTotalTime : formattedActiveTime}
              </Text>
            </View>
          )}
          {hasPassiveTime && formattedActiveTime && (
            <View style={styles.metaItem}>
              <Timer size={14} color={colors.accent} strokeWidth={1.5} />
              <Text style={[styles.metaText, { color: colors.accent }]}>
                {formattedActiveTime}
              </Text>
            </View>
          )}
          {servings && !hasPassiveTime && (
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
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overnightBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  overnightText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
