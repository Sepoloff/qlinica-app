/**
 * LazyLoadingFallback - Loading indicator for lazy-loaded screens
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface LazyLoadingFallbackProps {
  message?: string;
}

export const LazyLoadingFallback: React.FC<LazyLoadingFallbackProps> = ({
  message,
}) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message && <View style={styles.message}>{message}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default LazyLoadingFallback;
