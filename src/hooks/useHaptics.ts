// src/hooks/useHaptics.ts
// Haptic feedback utilities for Julienned

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Check if haptics are supported (not available on web)
const isSupported = Platform.OS !== 'web';

/**
 * Haptic feedback hook for tactile responses
 *
 * Usage:
 *   const haptics = useHaptics();
 *   haptics.light();     // Light tap - button press
 *   haptics.medium();    // Medium tap - long press trigger
 *   haptics.heavy();     // Heavy tap - significant action
 *   haptics.success();   // Success notification - recipe extracted
 *   haptics.warning();   // Warning notification - validation error
 *   haptics.error();     // Error notification - delete confirm
 *   haptics.selection(); // Selection change - checkbox toggle
 */
export function useHaptics() {
  return {
    /** Light tap - use for button press feedback */
    light: () => {
      if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },

    /** Medium tap - use for long press trigger, drag start */
    medium: () => {
      if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },

    /** Heavy tap - use for significant completed actions */
    heavy: () => {
      if (isSupported) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    },

    /** Success notification - use for completed extractions, saves */
    success: () => {
      if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },

    /** Warning notification - use for validation warnings */
    warning: () => {
      if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    },

    /** Error notification - use for delete confirm, errors */
    error: () => {
      if (isSupported) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },

    /** Selection change - use for checkbox toggle, option selection */
    selection: () => {
      if (isSupported) {
        Haptics.selectionAsync();
      }
    },
  };
}

// Non-hook version for use outside components
export const haptics = {
  light: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => isSupported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => isSupported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => isSupported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => isSupported && Haptics.selectionAsync(),
};
