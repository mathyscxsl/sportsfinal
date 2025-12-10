/**
 * LoadingSpinner Component
 * Indicateur de chargement avec message optionnel
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  message,
  size = 'large',
  color,
  style,
}: LoadingSpinnerProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color || colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  message: {
    ...TextStyles.body,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
