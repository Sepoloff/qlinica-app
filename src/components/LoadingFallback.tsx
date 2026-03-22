'use strict';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingFallbackProps {
  /** Show loading spinner */
  isLoading: boolean;
  /** Alternative: show error state */
  error?: string | null;
  /** Content to show when not loading */
  children: React.ReactNode;
  /** Custom spinner size */
  size?: 'small' | 'large';
  /** Custom loading message */
  loadingMessage?: string;
}

/**
 * LoadingFallback Component
 * 
 * Unified loading/error state management for screens and sections.
 * Shows spinner during loading, error message on failure, or children otherwise.
 * 
 * Usage:
 * ```tsx
 * <LoadingFallback isLoading={isLoading} error={error}>
 *   <YourContent />
 * </LoadingFallback>
 * ```
 */
export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  isLoading,
  error,
  children,
  size = 'large',
  loadingMessage = 'Carregando...',
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size={size} message={loadingMessage} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LoadingSpinner size="small" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    minHeight: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    minHeight: 200,
  },
});
