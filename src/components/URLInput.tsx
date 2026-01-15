// src/components/URLInput.tsx
// URL input with extract button for adding recipes

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard, Platform } from 'react-native';
import { Link } from 'lucide-react-native';
import { useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius, shadows, touchTargets } from '../styles/theme';

// Web-specific styles to remove browser focus outlines
const webInputStyle = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};

interface URLInputProps {
  onExtract: (url: string) => void;
  isLoading?: boolean;
  error?: string;
  clearTrigger?: number; // Increment this to clear the URL input
}

export function URLInput({ onExtract, isLoading = false, error, clearTrigger }: URLInputProps) {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const prevClearTrigger = useRef(clearTrigger);

  // Clear URL when clearTrigger changes
  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger !== prevClearTrigger.current) {
      setUrl('');
      prevClearTrigger.current = clearTrigger;
    }
  }, [clearTrigger]);

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
      <View style={styles.inputRow}>
        {/* URL Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: error
                ? colors.error
                : isFocused
                ? colors.buttonPrimary
                : colors.border,
            },
            shadows.sm,
          ]}
        >
          {/* URL Icon */}
          <View style={{ marginRight: spacing.sm }}>
            <Link size={20} color={isFocused ? colors.buttonPrimary : colors.textSecondary} strokeWidth={1.5} />
          </View>

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
            style={[styles.input, { color: colors.text }, webInputStyle as any]}
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
        </View>

        {/* Extract Button - Separate */}
        <Pressable
          onPress={handleExtract}
          disabled={!canSubmit}
          style={({ pressed, hovered }) => [
            styles.extractButton,
            {
              backgroundColor: !canSubmit
                ? colors.border
                : pressed
                ? colors.buttonPrimaryPressed
                : colors.buttonPrimary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
            shadows.sm,
          ]}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>⏳</Text>
          ) : (
            <Text style={[styles.extractText, { color: '#FFFFFF' }]}>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
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
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  extractButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
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
