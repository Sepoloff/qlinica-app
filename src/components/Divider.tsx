import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  vertical?: boolean;
  thickness?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color = `${COLORS.gold}20`,
  vertical = false,
  thickness = 1,
}) => {
  return (
    <View
      style={[
        styles.divider,
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: color,
          [vertical ? 'width' : 'height']: thickness,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: `${COLORS.gold}20`,
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    height: '100%',
    width: 1,
  },
});
