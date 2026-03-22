import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
}) => {
  const Wrapper = onPress ? require('react-native').TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.container,
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  elevated: {
    backgroundColor: COLORS.primaryLight,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: `${COLORS.gold}25`,
  },
  filled: {
    backgroundColor: `${COLORS.primaryDark}80`,
  },
});
