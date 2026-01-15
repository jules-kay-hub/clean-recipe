// src/styles/theme.ts
// Rogue Recipe Design System

export const colors = {
  // Primary Palette - Deep Navy
  navy: '#0D1B2A',
  navyLight: '#4A6FA5',
  navyMedium: '#3A5A8A', // Darker variant for pressed states

  // Accent Palette - Warm Rust (Von Restorff Effect)
  rust: '#B86A4A',
  rustLight: '#D4A08A',

  // Neutrals - Light Mode
  cream: '#FAF8F5', // Warm background (Aesthetic-Usability Effect)
  white: '#FFFFFF',
  ink: '#1A1A1A',
  stone: '#6B6B6B',
  border: '#E8E4E1',

  // Neutrals - Dark Mode
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkBorder: '#2E2E2E',
  offWhite: '#F5F5F5',
  warmGray: '#A0A0A0',

  // Semantic
  success: '#4A8C4A',
  successLight: '#6AAF6A',
  warning: '#D4A84A',
  warningLight: '#E4C06A',
  error: '#C45A5A',
  errorLight: '#D47A7A',
  info: '#5A8AC4',
  infoLight: '#7AAAE4',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const lightTheme = {
  colors: {
    primary: colors.navy,
    primaryDark: colors.navy,
    accent: colors.rust, // Warm accent for CTAs
    accentLight: colors.rustLight,

    background: colors.cream, // Warm cream background
    surface: colors.white,
    surfaceElevated: colors.white,

    text: colors.ink,
    textSecondary: colors.stone,
    textInverse: colors.white,
    textMuted: colors.stone,

    border: colors.border,
    borderFocus: colors.navy,

    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    tabBarActive: colors.navy,
    tabBarInactive: colors.stone,
    tabBarBackground: colors.white,

    cardBackground: colors.white,
    inputBackground: colors.cream,

    // CTA Button - prominent and accessible
    buttonPrimary: colors.navyLight,
    buttonPrimaryPressed: colors.navyMedium,

    checkboxActive: colors.navy,
    checkboxInactive: colors.border,

    overlay: colors.overlay,
  },
  isDark: false as boolean,
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.navyLight,
    primaryDark: colors.navy,
    accent: colors.rustLight, // Warm accent works on dark
    accentLight: colors.rust,

    background: colors.darkBackground,
    surface: colors.darkSurface,
    surfaceElevated: colors.darkBorder,

    text: colors.offWhite,
    textSecondary: colors.warmGray,
    textInverse: colors.ink,
    textMuted: colors.warmGray,

    border: colors.darkBorder,
    borderFocus: colors.navyLight,

    success: colors.successLight,
    warning: colors.warningLight,
    error: colors.errorLight,
    info: colors.infoLight,

    tabBarActive: colors.navyLight,
    tabBarInactive: colors.warmGray,
    tabBarBackground: colors.darkSurface,

    cardBackground: colors.darkSurface,
    inputBackground: colors.darkBorder,

    // CTA Button - prominent and accessible
    buttonPrimary: colors.navyLight,
    buttonPrimaryPressed: colors.navyMedium,

    checkboxActive: colors.navyLight,
    checkboxInactive: colors.darkBorder,

    overlay: colors.overlayLight,
  },
  isDark: true,
};

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    textMuted: string;
    border: string;
    borderFocus: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    tabBarActive: string;
    tabBarInactive: string;
    tabBarBackground: string;
    cardBackground: string;
    inputBackground: string;
    buttonPrimary: string;
    buttonPrimaryPressed: string;
    checkboxActive: string;
    checkboxInactive: string;
    overlay: string;
  };
  isDark: boolean;
}

export type ThemeColors = Theme['colors'];

// Typography - Fraunces serif for display, Inter for body
export const typography = {
  fonts: {
    sans: 'Inter-Regular',
    sansMedium: 'Inter-Medium',
    sansBold: 'Inter-SemiBold',
    display: 'Fraunces-SemiBold', // Elegant serif for headlines
    displayBold: 'Fraunces-Bold',
  },
  sizes: {
    hero: 32,
    title: 24,
    sectionHeader: 18,
    bodyLarge: 18,
    body: 16,
    caption: 14,
    label: 12,
    button: 16,
    // Kitchen mode (larger for glanceability)
    kitchenInstruction: 20,
    kitchenIngredient: 18,
    kitchenStep: 24,
  },
  lineHeights: {
    hero: 1.2,
    title: 1.3,
    sectionHeader: 1.4,
    body: 1.5,
    caption: 1.4,
    label: 1.3,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing (base unit: 4px) - unchanged
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius - reduced for sharper feel
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;

// Shadows - softer, flatter
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Animation - unchanged
export const animation = {
  timing: {
    quick: 150,
    standard: 250,
    page: 300,
  },
  easing: {
    default: [0.4, 0, 0.2, 1], // ease-out
  },
} as const;

// Touch targets - unchanged
export const touchTargets = {
  minimum: 44,
  recommended: 48,
} as const;
