import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SeparatorProps {
  style?: any;
  color?: string;
  height?: number;
}

/**
 * Simple separator/divider component
 */
export const Separator: React.FC<SeparatorProps> = ({
  style,
  color = '#34495E',
  height = 1,
}) => {
  return (
    <View
      style={[
        styles.separator,
        { borderBottomColor: color, borderBottomWidth: height },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    marginVertical: 12,
  },
});
