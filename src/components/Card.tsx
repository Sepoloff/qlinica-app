import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.primaryLight,
          shadowColor: COLORS.gold,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.primary,
          borderWidth: 1,
          borderColor: `${COLORS.gold}20`,
        };
      default:
        return {
          backgroundColor: COLORS.primaryLight,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          padding: getPaddingValue(),
        },
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});
