import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const styles = getStyles(variant, size);

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const getStyles = (variant: BadgeVariant, size: BadgeSize) => {
  const colors = {
    primary: { bg: `${COLORS.gold}30`, text: COLORS.gold },
    success: { bg: '#4CAF5030', text: '#4CAF50' },
    danger: { bg: `${COLORS.danger}30`, text: COLORS.danger },
    warning: { bg: '#FFA50030', text: '#FFA500' },
    info: { bg: `${COLORS.gold}20`, text: COLORS.gold },
  };

  const sizes = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
    medium: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 12 },
    large: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  };

  const color = colors[variant];
  const sizeConfig = sizes[size];

  return StyleSheet.create({
    badge: {
      backgroundColor: color.bg,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: color.text,
      fontFamily: 'DMSans',
    },
  });
};
