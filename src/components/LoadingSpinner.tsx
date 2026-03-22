'use strict';

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  containerStyle?: ViewStyle;
}

/**
 * Custom Loading Spinner Component
 * 
 * Branded loading indicator with optional message and full-screen support
 * 
 * @example
 * <LoadingSpinner size="large" message="Carregando..." fullScreen />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.gold,
  message,
  fullScreen = false,
  containerStyle,
}) => {
  const containerStyle_ = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={[containerStyle_, containerStyle]}>
      <ActivityIndicator
        size={size}
        color={color}
        style={styles.spinner}
      />
      {message && (
        <Text style={[styles.message, { color }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '500',
    marginTop: 8,
  },
});
