import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: COLORS.gold, text: COLORS.primaryDark },
  secondary: { bg: '#34495E', text: '#E8E8E8' },
  success: { bg: `${COLORS.success}25`, text: COLORS.success },
  danger: { bg: `${COLORS.danger}25`, text: COLORS.danger },
  warning: { bg: `${COLORS.warning}25`, text: COLORS.warning },
  info: { bg: `${COLORS.info}25`, text: COLORS.info },
};

const SIZE_STYLES = {
  small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 },
  medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 },
};

/**
 * Badge component for tags and labels
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.bg },
        {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyle.text, fontSize: sizeStyle.fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
});
