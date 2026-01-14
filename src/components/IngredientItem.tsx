// src/components/IngredientItem.tsx
// Checkable ingredient item for recipe detail and shopping list

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, touchTargets } from '../styles/theme';

interface IngredientItemProps {
  text: string;
  quantity?: number;
  unit?: string;
  item?: string;
  checked: boolean;
  onToggle: () => void;
  kitchenMode?: boolean; // Larger text for cooking
}

export function IngredientItem({
  text,
  quantity,
  unit,
  item,
  checked,
  onToggle,
  kitchenMode = false,
}: IngredientItemProps) {
  const colors = useColors();

  // Format quantity for display
  const formatQuantity = (num: number): string => {
    // Handle common fractions
    const fractions: Record<number, string> = {
      0.25: '¼',
      0.33: '⅓',
      0.5: '½',
      0.67: '⅔',
      0.75: '¾',
    };

    const decimal = num % 1;
    const whole = Math.floor(num);

    if (decimal === 0) return String(whole);

    const fractionStr = fractions[Math.round(decimal * 100) / 100] || decimal.toFixed(2);
    
    if (whole === 0) return fractionStr;
    return `${whole} ${fractionStr}`;
  };

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.border : 'transparent',
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.checkboxActive : colors.checkboxInactive,
            backgroundColor: checked ? colors.checkboxActive : 'transparent',
          },
        ]}
      >
        {checked && (
          <Text style={[styles.checkmark, { color: colors.textInverse }]}>✓</Text>
        )}
      </View>

      {/* Ingredient Text */}
      <View style={styles.textContainer}>
        {quantity && (
          <Text
            style={[
              styles.quantity,
              kitchenMode && styles.kitchenQuantity,
              { color: checked ? colors.textMuted : colors.text },
            ]}
          >
            {formatQuantity(quantity)}
          </Text>
        )}
        <Text
          style={[
            styles.text,
            kitchenMode && styles.kitchenText,
            {
              color: checked ? colors.textMuted : colors.text,
              textDecorationLine: checked ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}
        >
          {unit ? `${unit} ` : ''}{item || text}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: touchTargets.recommended,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  quantity: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  kitchenQuantity: {
    fontSize: typography.sizes.kitchenIngredient,
  },
  text: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    flexShrink: 1,
  },
  kitchenText: {
    fontSize: typography.sizes.kitchenIngredient,
  },
});
