import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'medium',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: COLORS.gold,
          borderColor: COLORS.gold,
        };
      case 'secondary':
        return {
          backgroundColor: COLORS.primaryLight,
          borderColor: `${COLORS.gold}40`,
        };
      case 'danger':
        return {
          backgroundColor: `${COLORS.danger}08`,
          borderColor: `${COLORS.danger}25`,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.gold,
        };
      default:
        return {
          backgroundColor: COLORS.gold,
          borderColor: COLORS.gold,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return COLORS.primaryDark;
    if (variant === 'danger') return COLORS.danger;
    if (variant === 'outline') return COLORS.gold;
    return COLORS.white;
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 15;
      default:
        return 13;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getTextSize(),
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  disabled: {
    opacity: 0.5,
  },
});
