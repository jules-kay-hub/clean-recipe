// src/screens/SettingsScreen.tsx
// Settings screen with profile, theme toggle, and sign out

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Sun, Moon, Smartphone, UtensilsCrossed, Ruler, Info, MessageSquare, Star, ChevronRight, LogOut, User } from 'lucide-react-native';
import { useTheme, useColors } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { typography, spacing, borderRadius } from '../styles/theme';
import { useOptionalTabBarVisibility } from '../hooks/useTabBarVisibility';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingRowProps {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingRow({ Icon, title, subtitle, onPress, showChevron, danger }: SettingRowProps) {
  const colors = useColors();

  const content = (
    <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
      <View style={styles.settingIconContainer}>
        <Icon size={20} color={danger ? colors.error : colors.textSecondary} strokeWidth={1.5} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: danger ? colors.error : colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
      )}
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
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ label, Icon, isSelected, onSelect }: ThemeOptionProps) {
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
      <Icon
        size={24}
        color={isSelected ? colors.textInverse : colors.textSecondary}
        strokeWidth={1.5}
      />
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
  const { onScroll } = useOptionalTabBarVisibility();
  const { user, clerkUser, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  // Get user display info
  const displayName = user?.name || clerkUser?.firstName || 'User';
  const email = user?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
  const avatarUrl = user?.avatarUrl || clerkUser?.imageUrl;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileInfo}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <User size={28} color={colors.primary} strokeWidth={1.5} />
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeOptions}>
            <ThemeOption
              mode="light"
              label="Light"
              Icon={Sun}
              isSelected={themeMode === 'light'}
              onSelect={() => handleThemeSelect('light')}
            />
            <ThemeOption
              mode="dark"
              label="Dark"
              Icon={Moon}
              isSelected={themeMode === 'dark'}
              onSelect={() => handleThemeSelect('dark')}
            />
            <ThemeOption
              mode="system"
              label="System"
              Icon={Smartphone}
              isSelected={themeMode === 'system'}
              onSelect={() => handleThemeSelect('system')}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          PREFERENCES
        </Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            Icon={UtensilsCrossed}
            title="Default Servings"
            subtitle="Serves 4"
            showChevron
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            Icon={Ruler}
            title="Measurement System"
            subtitle="US"
            showChevron
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          ABOUT
        </Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            Icon={Info}
            title="Julienned"
            subtitle="Version 1.0.0"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            Icon={MessageSquare}
            title="Feedback"
            onPress={() => Linking.openURL('mailto:feedback@julienned.app')}
            showChevron
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            Icon={Star}
            title="Rate"
            onPress={() => {}}
            showChevron
          />
        </View>

        {/* Account Section */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            Icon={LogOut}
            title={isSigningOut ? 'Signing out...' : 'Sign Out'}
            onPress={isSigningOut ? undefined : handleSignOut}
            danger
          />
        </View>

        {/* Tagline */}
        <View style={styles.footer}>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Just the recipe. Beautifully.
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
    paddingBottom: 100, // Account for floating tab bar
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    marginBottom: spacing.xs,
  },
  profileCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
  sectionHeader: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.label,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.body,
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
    gap: spacing.xs,
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
  settingIconContainer: {
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
  divider: {
    height: 1,
    marginLeft: spacing.md + 20 + spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
  },
  tagline: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
});
