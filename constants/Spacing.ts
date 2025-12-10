/**
 * Design System - Spacing
 * Système d'espacement cohérent basé sur une échelle de 4px
 */

export const Spacing = {
  // Base unit: 4px
  xs: 4,    // Extra small
  sm: 8,    // Small
  md: 16,   // Medium (base)
  lg: 24,   // Large
  xl: 32,   // Extra large
  xxl: 48,  // 2x Extra large
  xxxl: 64, // 3x Extra large
};

// Espacements pour des cas d'usage spécifiques
export const Layout = {
  // Padding des écrans
  screenPadding: Spacing.md,
  screenPaddingLarge: Spacing.lg,

  // Padding des cards
  cardPadding: Spacing.md,
  cardPaddingSmall: Spacing.sm,

  // Marges entre éléments
  itemGap: Spacing.md,
  itemGapSmall: Spacing.sm,
  itemGapLarge: Spacing.lg,

  // Sections
  sectionSpacing: Spacing.xl,
  sectionSpacingLarge: Spacing.xxl,

  // Bordures
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Ombres
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Hauteurs standard pour les composants
export const ComponentHeight = {
  input: 48,
  inputSmall: 40,
  inputLarge: 56,
  button: 48,
  buttonSmall: 36,
  buttonLarge: 56,
  tab: 48,
  header: 56,
};

// Largeurs
export const ComponentWidth = {
  buttonMinWidth: 100,
  inputMaxWidth: 400,
};
