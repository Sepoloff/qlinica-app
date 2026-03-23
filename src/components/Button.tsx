'use strict';

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import { triggerLightFeedback, triggerSuccessFeedback } from '../utils/hapticFeedback';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  children?: string | React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string | React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  enableHaptic?: boolean;
  hapticType?: 'light' | 'success';
  label?: string;
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'menuitem' | 'link';
  testID?: string;
}

const variantStyles = {
  primary: {
    backgroundColor: COLORS.gold,
    textColor: COLORS.primaryDark,
  },
  secondary: {
    backgroundColor: `${COLORS.gold}20`,
    textColor: COLORS.gold,
  },
  danger: {
    backgroundColor: COLORS.danger,
    textColor: COLORS.white,
  },
  success: {
    backgroundColor: COLORS.success,
    textColor: COLORS.white,
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: COLORS.gold,
    borderColor: COLORS.gold,
    borderWidth: 1.5,
  },
};

const sizeStyles = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 14,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: 16,
  },
};

/**
 * Reusable Button Component with multiple variants
 * 
 * @example
 * <Button
 *   title="Agendar"
 *   onPress={() => {}}
 *   variant="primary"
 *   size="large"
 *   fullWidth
 * />
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  children,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  enableHaptic = true,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
}) => {
  const buttonText = children || label || title || '';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const handlePress = async () => {
    if (enableHaptic) {
      if (hapticType === 'success') {
        await triggerSuccessFeedback();
      } else {
        await triggerLightFeedback();
      }
    }
    onPress();
  };

  // Build accessibility label
  const a11yLabel = accessibilityLabel || String(buttonText);
  const a11yHint = loading ? 'em progresso' : accessibilityHint;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityLabel={a11yLabel}
      accessibilityHint={a11yHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderColor: (variantStyle as any).borderColor,
          borderWidth: (variantStyle as any).borderWidth || 0,
          opacity: disabled || loading ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
          minHeight: 48,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator color={variantStyle.textColor} size="small" style={{ marginRight: 8 }} />}
        {icon && typeof icon === 'string' && <Text style={{ marginRight: 8, fontSize: 18 }}>{icon}</Text>}
        {icon && typeof icon !== 'string' && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text
          style={[
            styles.text,
            {
              color: variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
              fontWeight: '600',
            },
            textStyle,
          ]}
        >
          {buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'DMSans',
    textAlign: 'center',
  },
});
