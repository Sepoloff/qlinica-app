import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface LoadingButtonProps {
  onPress: () => void | Promise<void>;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    };

    // Size styles
    const sizeStyles: { [key in typeof size]: ViewStyle } = {
      small: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: {
      [key in typeof variant]: ViewStyle & { color: string };
    } = {
      primary: {
        backgroundColor: COLORS.gold,
        color: COLORS.primaryDark,
      },
      secondary: {
        backgroundColor: `${COLORS.gold}15`,
        borderWidth: 1.5,
        borderColor: `${COLORS.gold}40`,
        color: COLORS.gold,
      },
      danger: {
        backgroundColor: `${COLORS.danger}08`,
        borderWidth: 1.5,
        borderColor: `${COLORS.danger}25`,
        color: COLORS.danger,
      },
      success: {
        backgroundColor: `${COLORS.success}15`,
        borderWidth: 1.5,
        borderColor: `${COLORS.success}40`,
        color: COLORS.success,
      },
    };

    const variantStyle = variantStyles[variant];
    const { color, ...variantRest } = variantStyle;

    return [
      baseStyle,
      sizeStyles[size],
      variantRest,
      isDisabled && { opacity: 0.5 },
      style,
    ];
  };

  const getTextStyle = () => {
    const sizeTextStyles: { [key in typeof size]: TextStyle } = {
      small: { fontSize: 12, fontWeight: '600' },
      medium: { fontSize: 14, fontWeight: '700' },
      large: { fontSize: 16, fontWeight: '700' },
    };

    const variantColors: { [key in typeof variant]: string } = {
      primary: COLORS.primaryDark,
      secondary: COLORS.gold,
      danger: COLORS.danger,
      success: COLORS.success,
    };

    return [
      sizeTextStyles[size],
      { color: variantColors[variant], fontFamily: 'DMSans' },
      textStyle,
    ];
  };

  const loaderColor = variant === 'primary' ? COLORS.primaryDark : COLORS.gold;

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      activeOpacity={0.7}
    >
      {loading && <ActivityIndicator size="small" color={loaderColor} />}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
