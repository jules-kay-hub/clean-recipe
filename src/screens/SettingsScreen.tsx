// src/screens/SettingsScreen.tsx
// Settings screen with theme toggle and app preferences

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useTheme, useColors } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, title, subtitle, onPress, rightElement }: SettingRowProps) {
  const colors = useColors();

  const content = (
    <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ mode, label, icon, isSelected, onSelect }: ThemeOptionProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.themeIcon}>{icon}</Text>
      <Text
        style={[
          styles.themeLabel,
          { color: isSelected ? colors.textInverse : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const colors = useColors();

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        {/* Theme Section */}
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>
          APPEARANCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Choose how CleanRecipe looks
          </Text>
          <View style={styles.themeOptions}>
            <ThemeOption
              mode="light"
              label="Light"
              icon="☀️"
              isSelected={themeMode === 'light'}
              onSelect={() => handleThemeSelect('light')}
            />
            <ThemeOption
              mode="dark"
              label="Dark"
              icon="🌙"
              isSelected={themeMode === 'dark'}
              onSelect={() => handleThemeSelect('dark')}
            />
            <ThemeOption
              mode="system"
              label="System"
              icon="📱"
              isSelected={themeMode === 'system'}
              onSelect={() => handleThemeSelect('system')}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>
          PREFERENCES
        </Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="🍽️"
            title="Default Servings"
            subtitle="4 servings"
            rightElement={
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="📏"
            title="Measurement System"
            subtitle="US (cups, tablespoons)"
            rightElement={
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            }
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>
          ABOUT
        </Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="📖"
            title="CleanRecipe"
            subtitle="Version 1.0.0"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="💬"
            title="Send Feedback"
            onPress={() => Linking.openURL('mailto:feedback@cleanrecipe.app')}
            rightElement={
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="⭐"
            title="Rate the App"
            onPress={() => {}}
            rightElement={
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            }
          />
        </View>

        {/* Tagline */}
        <View style={styles.footer}>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Just the recipe. Nothing else.
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Made with 🍳 for home cooks
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
  sectionHeader: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.label,
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginBottom: spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  themeLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
  },
  settingsGroup: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.body,
  },
  settingSubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    marginLeft: spacing.md + 20 + spacing.md, // icon + margin
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  tagline: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.body,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  footerText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
});
