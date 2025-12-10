/**
 * Button Component
 * Composant bouton avec différents variants et tailles
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout, ComponentHeight } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const colors = useThemeColors();

  const isDisabled = disabled || loading;

  // Styles selon le variant
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? colors.disabled : colors.primary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? colors.disabled : colors.secondary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled ? colors.disabled : colors.primary,
          },
          text: {
            color: isDisabled ? colors.disabledText : colors.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? colors.disabled : colors.error,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled ? colors.disabledText : colors.primary,
          },
        };
    }
  };

  // Styles selon la taille
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            height: ComponentHeight.buttonSmall,
            paddingHorizontal: Spacing.md,
          },
          text: TextStyles.buttonSmall,
        };
      case 'md':
        return {
          container: {
            height: ComponentHeight.button,
            paddingHorizontal: Spacing.lg,
          },
          text: TextStyles.button,
        };
      case 'lg':
        return {
          container: {
            height: ComponentHeight.buttonLarge,
            paddingHorizontal: Spacing.xl,
          },
          text: TextStyles.buttonLarge,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[sizeStyles.text, variantStyles.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
});
