/**
 * Input Component
 * Composant input avec label et gestion d'erreurs
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout, ComponentHeight } from '@/constants/Spacing';
import { TextStyles, FontSize } from '@/constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  size = 'md',
  style,
  ...textInputProps
}: InputProps) {
  const colors = useThemeColors();

  const hasError = !!error;

  const getInputHeight = () => {
    switch (size) {
      case 'sm':
        return ComponentHeight.inputSmall;
      case 'md':
        return ComponentHeight.input;
      case 'lg':
        return ComponentHeight.inputLarge;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <TextInput
        style={[
          styles.input,
          {
            height: getInputHeight(),
            backgroundColor: colors.backgroundSecondary,
            borderColor: hasError ? colors.error : colors.border,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        {...textInputProps}
      />

      {hasError && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      {!hasError && helperText && (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...TextStyles.label,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.base,
    ...TextStyles.body,
  },
  errorText: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  helperText: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
});
