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
  autoFocus?: boolean; // Auto-focus input on mount
  focusTrigger?: number; // Increment this to focus the input
}

export function URLInput({ onExtract, isLoading = false, error, clearTrigger, autoFocus = false, focusTrigger }: URLInputProps) {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const prevClearTrigger = useRef(clearTrigger);
  const prevFocusTrigger = useRef(focusTrigger);
  const inputRef = useRef<TextInput>(null);

  // Clear URL when clearTrigger changes
  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger !== prevClearTrigger.current) {
      setUrl('');
      prevClearTrigger.current = clearTrigger;
    }
  }, [clearTrigger]);

  // Focus input when focusTrigger changes
  useEffect(() => {
    if (focusTrigger !== undefined && focusTrigger !== prevFocusTrigger.current) {
      prevFocusTrigger.current = focusTrigger;
      // Small delay to ensure screen transition is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [focusTrigger]);

  // Handle autoFocus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

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
          <View style={styles.iconContainer}>
            <Link size={20} color={isFocused ? colors.buttonPrimary : colors.textSecondary} strokeWidth={1.5} />
          </View>

          {/* Input */}
          <TextInput
            ref={inputRef}
            value={url}
            onChangeText={setUrl}
            placeholder=""
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
          style={({ pressed }) => [
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
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  extractButton: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    height: 48,
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
