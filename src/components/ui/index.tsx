// src/components/ui/index.tsx
// Julienned UI Component Library

import React, { ReactNode, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useColors } from '../../hooks/useTheme';
import { typography, spacing, borderRadius, shadows, touchTargets } from '../../styles/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface TextProps {
  children: ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

export function HeroTitle({ children, style }: TextProps) {
  const colors = useColors();
  return (
    <Text style={[{
      fontFamily: typography.fonts.display,
      fontSize: typography.sizes.hero,
      lineHeight: typography.sizes.hero * typography.lineHeights.hero,
      color: colors.text,
    }, style]}>
      {children}
    </Text>
  );
}

export function ScreenTitle({ children, style }: TextProps) {
  const colors = useColors();
  return (
    <Text style={[{
      fontFamily: typography.fonts.display,
      fontSize: typography.sizes.title,
      lineHeight: typography.sizes.title * typography.lineHeights.title,
      color: colors.text,
    }, style]}>
      {children}
    </Text>
  );
}

export function SectionHeader({ children, style }: TextProps) {
  const colors = useColors();
  return (
    <Text style={[{
      fontFamily: typography.fonts.sansMedium,
      fontSize: typography.sizes.label,
      lineHeight: typography.sizes.label * typography.lineHeights.label,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    }, style]}>
      {children}
    </Text>
  );
}

export function BodyText({ children, style }: TextProps) {
  const colors = useColors();
  return (
    <Text style={[{
      fontFamily: typography.fonts.sans,
      fontSize: typography.sizes.body,
      lineHeight: typography.sizes.body * typography.lineHeights.body,
      color: colors.text,
    }, style]}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, numberOfLines }: TextProps) {
  const colors = useColors();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{
        fontFamily: typography.fonts.sans,
        fontSize: typography.sizes.caption,
        lineHeight: typography.sizes.caption * typography.lineHeights.caption,
        color: colors.textSecondary,
      }, style]}
    >
      {children}
    </Text>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
}: ButtonProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary': return colors.buttonPrimary;
      case 'accent': return colors.buttonPrimary; // Unified forest green for all CTAs
      case 'secondary': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary': return colors.textInverse;
      case 'accent': return colors.textInverse;
      case 'secondary': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === 'secondary') return colors.primary;
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md': return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.md,
          borderWidth: variant === 'secondary' ? 2 : 0,
          borderColor: getBorderColor(),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          minHeight: touchTargets.recommended,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...getPadding(),
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{
            fontFamily: typography.fonts.sansMedium,
            fontSize: typography.sizes.button,
            color: getTextColor(),
          }}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  secureTextEntry?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  secureTextEntry = false,
  leftIcon,
  rightIcon,
}: InputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={style}>
      {label && (
        <Text style={{
          fontFamily: typography.fonts.sansMedium,
          fontSize: typography.sizes.caption,
          color: colors.textSecondary,
          marginBottom: spacing.xs,
        }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: error ? colors.error : isFocused ? colors.borderFocus : colors.border,
        paddingHorizontal: spacing.md,
        minHeight: touchTargets.recommended,
      }}>
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[{
            flex: 1,
            fontFamily: typography.fonts.sans,
            fontSize: typography.sizes.body,
            color: colors.text,
            paddingVertical: spacing.md,
          }, inputStyle]}
        />
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={{
          fontFamily: typography.fonts.sans,
          fontSize: typography.sizes.caption,
          color: colors.error,
          marginTop: spacing.xs,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({ children, onPress, style, padding = 'md' }: CardProps) {
  const colors = useColors();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing[padding],
    ...shadows.md,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKBOX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  labelStyle?: TextStyle;
  size?: number;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  labelStyle,
  size = 24,
}: CheckboxProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: touchTargets.minimum,
      }}
    >
      <View style={{
        width: size,
        height: size,
        borderRadius: borderRadius.sm / 2,
        borderWidth: 2,
        borderColor: checked ? colors.checkboxActive : colors.checkboxInactive,
        backgroundColor: checked ? colors.checkboxActive : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: label ? spacing.sm : 0,
      }}>
        {checked && (
          <Text style={{ color: colors.textInverse, fontSize: size * 0.6, fontWeight: 'bold' }}>
            ✓
          </Text>
        )}
      </View>
      {label && (
        <Text style={[{
          fontFamily: typography.fonts.sans,
          fontSize: typography.sizes.body,
          color: checked ? colors.textMuted : colors.text,
          textDecorationLine: checked ? 'line-through' : 'none',
          flex: 1,
        }, labelStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DIVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  const colors = useColors();
  return (
    <View style={[{
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    }, style]} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.primary;
    }
  };

  return (
    <View style={[{
      backgroundColor: getBackgroundColor(),
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    }, style]}>
      <Text style={{
        fontFamily: typography.fonts.sansMedium,
        fontSize: typography.sizes.label,
        color: colors.textInverse,
      }}>
        {children}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function Spinner({ size = 'large', color }: SpinnerProps) {
  const colors = useColors();
  return (
    <ActivityIndicator
      size={size}
      color={color || colors.primary}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateMessage {
  title: string;
  description?: string;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  messages?: EmptyStateMessage[];
  rotateInterval?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  messages,
  rotateInterval = 4000,
  action
}: EmptyStateProps) {
  const colors = useColors();
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate through messages
  useEffect(() => {
    if (!messages || messages.length <= 1) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [messages, rotateInterval]);

  // Get current display content
  const displayTitle = messages ? messages[messageIndex].title : title;
  const displayDescription = messages ? messages[messageIndex].description : description;

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    }}>
      {icon && (
        <View style={{ marginBottom: spacing.lg }}>
          {icon}
        </View>
      )}
      <Text style={{
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.sectionHeader,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
      }}>
        {displayTitle}
      </Text>
      {displayDescription && (
        <Text style={{
          fontFamily: typography.fonts.sans,
          fontSize: typography.sizes.body,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.lg,
        }}>
          {displayDescription}
        </Text>
      )}
      {action && (
        <Button onPress={action.onPress} variant="accent">
          {action.label}
        </Button>
      )}
    </View>
  );
}
