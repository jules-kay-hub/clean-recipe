// src/styles/theme.ts
// CleanRecipe Design System

export const colors = {
  // Primary Palette
  sage: '#5C7C5A',
  sageDark: '#4A6548',
  sageLight: '#7A9E78',
  
  terracotta: '#C4704E',
  terracottaDark: '#A55A3A',
  terracottaLight: '#D4896A',
  
  // Neutrals - Light Mode
  cream: '#FAF8F5',
  white: '#FFFFFF',
  charcoal: '#2D2D2D',
  stone: '#6B6B6B',
  mist: '#E8E5E0',
  
  // Neutrals - Dark Mode
  deepCharcoal: '#1A1A1A',
  darkSurface: '#2A2A2A',
  darkBorder: '#3A3A3A',
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
    primary: colors.sage,
    primaryDark: colors.sageDark,
    accent: colors.terracotta,
    accentLight: colors.terracottaLight,

    background: colors.cream,
    surface: colors.white,
    surfaceElevated: colors.white,

    text: colors.charcoal,
    textSecondary: colors.stone,
    textInverse: colors.white,
    textMuted: colors.stone,

    border: colors.mist,
    borderFocus: colors.sage,

    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    tabBarActive: colors.sage,
    tabBarInactive: colors.stone,
    tabBarBackground: colors.white,

    cardBackground: colors.white,
    inputBackground: colors.cream,

    checkboxActive: colors.terracotta,
    checkboxInactive: colors.mist,

    overlay: colors.overlay,
  },
  isDark: false as boolean,
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.sageLight,
    primaryDark: colors.sage,
    accent: colors.terracottaLight,
    accentLight: colors.terracotta,

    background: colors.deepCharcoal,
    surface: colors.darkSurface,
    surfaceElevated: colors.darkBorder,

    text: colors.offWhite,
    textSecondary: colors.warmGray,
    textInverse: colors.charcoal,
    textMuted: colors.warmGray,

    border: colors.darkBorder,
    borderFocus: colors.sageLight,

    success: colors.successLight,
    warning: colors.warningLight,
    error: colors.errorLight,
    info: colors.infoLight,

    tabBarActive: colors.sageLight,
    tabBarInactive: colors.warmGray,
    tabBarBackground: colors.darkSurface,

    cardBackground: colors.darkSurface,
    inputBackground: colors.darkBorder,

    checkboxActive: colors.terracottaLight,
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
    checkboxActive: string;
    checkboxInactive: string;
    overlay: string;
  };
  isDark: boolean;
}

export type ThemeColors = Theme['colors'];

// Typography
export const typography = {
  fonts: {
    sans: 'DMSans-Regular',
    sansMedium: 'DMSans-Medium',
    sansBold: 'DMSans-Bold',
    display: 'Fraunces-SemiBold',
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

// Spacing (base unit: 4px)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// Animation
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

// Touch targets
export const touchTargets = {
  minimum: 44,
  recommended: 48,
} as const;
