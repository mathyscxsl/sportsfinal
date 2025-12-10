/**
 * Design System - Colors
 * Palette de couleurs pour les thèmes light et dark
 */

export const Colors = {
  light: {
    // Primary colors - Bleu sportif énergique
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    primaryLight: '#3B82F6',

    // Secondary colors - Orange motivation
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    secondaryLight: '#FBBF24',

    // Success
    success: '#10B981',
    successDark: '#059669',
    successLight: '#34D399',

    // Error/Danger
    error: '#EF4444',
    errorDark: '#DC2626',
    errorLight: '#F87171',

    // Warning
    warning: '#F59E0B',
    warningDark: '#D97706',
    warningLight: '#FBBF24',

    // Info
    info: '#3B82F6',
    infoDark: '#2563EB',
    infoLight: '#60A5FA',

    // Neutrals
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Surfaces
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',

    // Interactive
    disabled: '#D1D5DB',
    disabledText: '#9CA3AF',

    // Shadows
    shadow: '#000000',
  },

  dark: {
    // Primary colors
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',

    // Secondary colors
    secondary: '#FBBF24',
    secondaryDark: '#F59E0B',
    secondaryLight: '#FCD34D',

    // Success
    success: '#34D399',
    successDark: '#10B981',
    successLight: '#6EE7B7',

    // Error/Danger
    error: '#F87171',
    errorDark: '#EF4444',
    errorLight: '#FCA5A5',

    // Warning
    warning: '#FBBF24',
    warningDark: '#F59E0B',
    warningLight: '#FCD34D',

    // Info
    info: '#60A5FA',
    infoDark: '#3B82F6',
    infoLight: '#93C5FD',

    // Neutrals
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',

    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',

    border: '#374151',
    borderLight: '#4B5563',

    // Surfaces
    card: '#1F2937',
    cardElevated: '#374151',

    // Interactive
    disabled: '#4B5563',
    disabledText: '#6B7280',

    // Shadows
    shadow: '#000000',
  },
};

// Couleurs sémantiques pour les types de séances
export const SessionTypeColors = {
  AMRAP: {
    light: '#8B5CF6',
    dark: '#A78BFA',
    background: '#EDE9FE',
  },
  HIIT: {
    light: '#EF4444',
    dark: '#F87171',
    background: '#FEE2E2',
  },
  EMOM: {
    light: '#F59E0B',
    dark: '#FBBF24',
    background: '#FEF3C7',
  },
  CUSTOM: {
    light: '#10B981',
    dark: '#34D399',
    background: '#D1FAE5',
  },
};

// Couleurs pour les catégories d'exercices
export const ExerciseCategoryColors = {
  cardio: {
    light: '#EF4444',
    dark: '#F87171',
    background: '#FEE2E2',
  },
  strength: {
    light: '#3B82F6',
    dark: '#60A5FA',
    background: '#DBEAFE',
  },
  mobility: {
    light: '#10B981',
    dark: '#34D399',
    background: '#D1FAE5',
  },
  other: {
    light: '#6B7280',
    dark: '#9CA3AF',
    background: '#F3F4F6',
  },
};

export type ColorScheme = 'light' | 'dark';
