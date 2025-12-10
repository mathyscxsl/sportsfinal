/**
 * Card Component
 * Composant carte avec variantes et sous-composants
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/Spacing';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  style?: ViewStyle;
}

export function Card({ children, variant = 'elevated', padding, style }: CardProps) {
  const colors = useThemeColors();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...Layout.shadow.medium,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.backgroundSecondary,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyles(),
        { padding: padding ?? Layout.cardPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Sous-composants pour structure de Card

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.borderRadius.lg,
    width: '100%',
  },
  header: {
    marginBottom: Spacing.md,
  },
  content: {
    // Pas de style par défaut, flexible
  },
  footer: {
    marginTop: Spacing.md,
  },
});
