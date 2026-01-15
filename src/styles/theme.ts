// src/styles/theme.ts
// Julienned Design System — Premium Cookbook Aesthetic

export const colors = {
  // Primary Palette - Forest Green
  forest: '#2D4A3E',
  forestLight: '#4A7A6A',
  forestMedium: '#3A6A5A', // Pressed state variant

  // Accent Palette - Copper (Premium kitchenware aesthetic)
  copper: '#B87333',
  copperLight: '#D4A574',

  // Neutrals - Light Mode
  linen: '#F5F0EB', // Warm natural background
  white: '#FFFFFF',
  ink: '#1A1A1A',
  stone: '#6B6B6B',
  border: '#E5E0DB',

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
    primary: colors.forest,
    primaryDark: colors.forest,
    accent: colors.copper, // Warm copper accent for CTAs
    accentLight: colors.copperLight,

    background: colors.linen, // Warm linen background
    surface: colors.white,
    surfaceElevated: colors.white,

    text: colors.ink,
    textSecondary: colors.stone,
    textInverse: colors.white,
    textMuted: colors.stone,

    border: colors.border,
    borderFocus: colors.forestLight,

    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,

    tabBarActive: colors.forest,
    tabBarInactive: colors.stone,
    tabBarBackground: colors.white,

    cardBackground: colors.white,
    inputBackground: colors.linen,

    // CTA Button - prominent and accessible
    buttonPrimary: colors.forestLight,
    buttonPrimaryPressed: colors.forestMedium,

    checkboxActive: colors.forest,
    checkboxInactive: colors.border,

    overlay: colors.overlay,
  },
  isDark: false as boolean,
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.forestLight,
    primaryDark: colors.forest,
    accent: colors.copperLight, // Warm copper works on dark
    accentLight: colors.copper,

    background: colors.darkBackground,
    surface: colors.darkSurface,
    surfaceElevated: colors.darkBorder,

    text: colors.offWhite,
    textSecondary: colors.warmGray,
    textInverse: colors.ink,
    textMuted: colors.warmGray,

    border: colors.darkBorder,
    borderFocus: colors.forestLight,

    success: colors.successLight,
    warning: colors.warningLight,
    error: colors.errorLight,
    info: colors.infoLight,

    tabBarActive: colors.forestLight,
    tabBarInactive: colors.warmGray,
    tabBarBackground: colors.darkSurface,

    cardBackground: colors.darkSurface,
    inputBackground: colors.darkBorder,

    // CTA Button - prominent and accessible
    buttonPrimary: colors.forestLight,
    buttonPrimaryPressed: colors.forestMedium,

    checkboxActive: colors.forestLight,
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
