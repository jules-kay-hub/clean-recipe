// src/components/ServingsAdjuster.tsx
// Stepper component for adjusting recipe servings

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, touchTargets } from '../styles/theme';

interface ServingsAdjusterProps {
  value: number;
  originalValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function ServingsAdjuster({
  value,
  originalValue,
  onChange,
  min = 1,
  max = 24,
}: ServingsAdjusterProps) {
  const colors = useColors();

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const reset = () => {
    onChange(originalValue);
  };

  const isModified = value !== originalValue;
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.container}>
      {/* Decrement Button */}
      <Pressable
        onPress={decrement}
        disabled={!canDecrement}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: !canDecrement ? 0.4 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>−</Text>
      </Pressable>

      {/* Value Display */}
      <Pressable
        onLongPress={reset}
        style={[
          styles.valueContainer,
          {
            backgroundColor: isModified ? colors.accent : colors.surface,
            borderColor: isModified ? colors.accent : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.value,
            { color: isModified ? colors.textInverse : colors.text },
          ]}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.label,
            { color: isModified ? colors.textInverse : colors.textSecondary },
          ]}
        >
          {value === 1 ? 'serving' : 'servings'}
        </Text>
      </Pressable>

      {/* Increment Button */}
      <Pressable
        onPress={increment}
        disabled={!canIncrement}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: !canIncrement ? 0.4 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>+</Text>
      </Pressable>

      {/* Reset indicator */}
      {isModified && (
        <Text style={[styles.resetHint, { color: colors.textMuted }]}>
          Long press to reset
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    width: touchTargets.recommended,
    height: touchTargets.recommended,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    gap: spacing.xs,
    minWidth: 120,
    justifyContent: 'center',
  },
  value: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.title,
  },
  label: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
  resetHint: {
    width: '100%',
    textAlign: 'center',
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.label,
    marginTop: spacing.xs,
  },
});
