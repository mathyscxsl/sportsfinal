/**
 * Badge Component
 * Petit label coloré pour afficher des statuts ou catégories
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({ children, variant = 'primary', size = 'md', style }: BadgeProps) {
  const colors = useThemeColors();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primaryLight + '20' },
          text: { color: colors.primaryDark },
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondaryLight + '20' },
          text: { color: colors.secondaryDark },
        };
      case 'success':
        return {
          container: { backgroundColor: colors.successLight + '20' },
          text: { color: colors.successDark },
        };
      case 'error':
        return {
          container: { backgroundColor: colors.errorLight + '20' },
          text: { color: colors.errorDark },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warningLight + '20' },
          text: { color: colors.warningDark },
        };
      case 'info':
        return {
          container: { backgroundColor: colors.infoLight + '20' },
          text: { color: colors.infoDark },
        };
      case 'neutral':
        return {
          container: { backgroundColor: colors.backgroundTertiary },
          text: { color: colors.textSecondary },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: Spacing.xs,
            paddingVertical: 2,
          },
          text: {
            fontSize: 10,
          },
        };
      case 'md':
        return {
          container: {
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
          },
          text: TextStyles.caption,
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.xs,
          },
          text: TextStyles.bodySmall,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, variantStyles.container, sizeStyles.container, style]}>
      <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
