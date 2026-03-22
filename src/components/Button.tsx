import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const styles = getStyles(variant, size);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? COLORS.gold : COLORS.white}
          size="small"
        />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (variant: ButtonVariant, size: ButtonSize) => {
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 14,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: 15,
    },
  };

  const config = sizeStyles[size];

  const variantStyles = {
    primary: StyleSheet.create({
      button: {
        backgroundColor: COLORS.gold,
        borderRadius: 14,
        paddingVertical: config.paddingVertical,
        paddingHorizontal: config.paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 8,
      },
      buttonDisabled: {
        opacity: 0.5,
      },
      text: {
        fontSize: config.fontSize,
        fontWeight: '700',
        color: COLORS.primaryDark,
        fontFamily: 'DMSans',
      },
    }),
    secondary: StyleSheet.create({
      button: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 12,
        paddingVertical: config.paddingVertical,
        paddingHorizontal: config.paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: `${COLORS.gold}30`,
      },
      buttonDisabled: {
        opacity: 0.5,
      },
      text: {
        fontSize: config.fontSize,
        fontWeight: '600',
        color: COLORS.gold,
        fontFamily: 'DMSans',
      },
    }),
    danger: StyleSheet.create({
      button: {
        backgroundColor: `${COLORS.danger}15`,
        borderRadius: 12,
        paddingVertical: config.paddingVertical,
        paddingHorizontal: config.paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: `${COLORS.danger}40`,
      },
      buttonDisabled: {
        opacity: 0.5,
      },
      text: {
        fontSize: config.fontSize,
        fontWeight: '600',
        color: COLORS.danger,
        fontFamily: 'DMSans',
      },
    }),
    ghost: StyleSheet.create({
      button: {
        backgroundColor: 'transparent',
        paddingVertical: config.paddingVertical,
        paddingHorizontal: config.paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonDisabled: {
        opacity: 0.5,
      },
      text: {
        fontSize: config.fontSize,
        fontWeight: '600',
        color: COLORS.gold,
        fontFamily: 'DMSans',
      },
    }),
  };

  return variantStyles[variant];
};
