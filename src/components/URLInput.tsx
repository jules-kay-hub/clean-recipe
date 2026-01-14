// src/components/URLInput.tsx
// URL input with extract button for adding recipes

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, shadows, touchTargets } from '../styles/theme';

interface URLInputProps {
  onExtract: (url: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function URLInput({ onExtract, isLoading = false, error }: URLInputProps) {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleExtract = () => {
    if (url.trim()) {
      Keyboard.dismiss();
      onExtract(url.trim());
    }
  };

  const isValidUrl = (text: string): boolean => {
    try {
      const parsed = new URL(text.startsWith('http') ? text : `https://${text}`);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canSubmit = url.trim().length > 0 && !isLoading;
  const showValidation = url.length > 0 && !isValidUrl(url);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.borderFocus
              : colors.border,
          },
          shadows.sm,
        ]}
      >
        {/* URL Icon */}
        <Text style={styles.icon}>🔗</Text>

        {/* Input */}
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="Paste recipe URL..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={handleExtract}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!isLoading}
          style={[styles.input, { color: colors.text }]}
        />

        {/* Clear Button */}
        {url.length > 0 && !isLoading && (
          <Pressable
            onPress={() => setUrl('')}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        )}

        {/* Extract Button */}
        <Pressable
          onPress={handleExtract}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.extractButton,
            {
              backgroundColor: canSubmit ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>⏳</Text>
          ) : (
            <Text style={[styles.extractText, { color: colors.textInverse }]}>
              Extract
            </Text>
          )}
        </Pressable>
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}

      {/* Validation Hint */}
      {showValidation && !error && (
        <Text style={[styles.hint, { color: colors.warning }]}>
          Enter a valid URL (e.g., allrecipes.com/recipe/...)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    paddingLeft: spacing.md,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    paddingVertical: spacing.md,
    minHeight: touchTargets.recommended,
  },
  clearButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  extractButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'center',
    minHeight: touchTargets.recommended,
  },
  extractText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.button,
  },
  loadingText: {
    fontSize: 18,
  },
  error: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginTop: spacing.sm,
    marginLeft: spacing.md,
  },
  hint: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginTop: spacing.sm,
    marginLeft: spacing.md,
  },
});
