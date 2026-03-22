import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface SectionDividerProps {
  title?: string;
  style?: any;
}

/**
 * Visual section divider with optional title
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({ title, style }) => {
  if (!title) {
    return <View style={[styles.divider, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#34495E',
    marginVertical: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#34495E',
  },
  title: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#8895a0',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
