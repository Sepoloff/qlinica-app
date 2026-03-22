'use strict';

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: boolean;
  bordered?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

/**
 * Reusable Card Component
 * 
 * Used for displaying grouped content with consistent styling
 * 
 * @example
 * <Card shadow>
 *   <Text>Card content</Text>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  shadow = false,
  bordered = false,
  highlighted = false,
  disabled = false,
  onPress,
}) => {
  const cardStyle = {
    backgroundColor: highlighted ? `${COLORS.gold}10` : COLORS.primaryLight,
    borderColor: highlighted ? COLORS.gold : `${COLORS.gold}20`,
    borderWidth: bordered ? 1.5 : 0,
    opacity: disabled ? 0.6 : 1,
  };

  const content = (
    <View
      style={[
        styles.card,
        cardStyle,
        shadow && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <View style={styles.touchableWrapper}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
  },
  shadow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  touchableWrapper: {
    flex: 1,
  },
});
