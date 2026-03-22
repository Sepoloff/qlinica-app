'use strict';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  containerStyle?: ViewStyle;
  showProgress?: boolean;
  progress?: number; // 0-100
  variant?: 'default' | 'minimal' | 'branded';
}

/**
 * Enhanced Loading Spinner Component
 * 
 * Branded loading indicator with optional message, progress, and full-screen support
 * - Multiple variants: default, minimal, branded
 * - Progress bar support
 * - Smooth animations
 * - Customizable colors and messages
 * 
 * @example
 * <LoadingSpinner size="large" message="Carregando..." fullScreen />
 * <LoadingSpinner showProgress progress={45} message="45% completo" />
 * <LoadingSpinner variant="minimal" size="small" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.gold,
  message,
  subMessage,
  fullScreen = false,
  containerStyle,
  showProgress = false,
  progress = 0,
  variant = 'default',
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      setDisplayProgress(Math.min(100, Math.max(0, progress)));
    }
  }, [showProgress, progress]);

  const containerStyle_ = fullScreen 
    ? [styles.fullScreen, { backgroundColor: variant === 'branded' ? COLORS.primary : 'transparent' }]
    : styles.container;

  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <View style={styles.minimalContainer}>
            <ActivityIndicator size="small" color={color} />
          </View>
        );
      
      case 'branded':
        return (
          <View style={styles.brandedContainer}>
            <View style={styles.brandedLogo}>
              <Text style={styles.logoText}>Q</Text>
            </View>
            <ActivityIndicator size={size} color={color} style={styles.spinner} />
            {message && (
              <Text style={[styles.message, { color: COLORS.text }]}>
                {message}
              </Text>
            )}
            {subMessage && (
              <Text style={[styles.subMessage, { color: COLORS.textLight }]}>
                {subMessage}
              </Text>
            )}
          </View>
        );
      
      default:
        return (
          <View style={styles.defaultContainer}>
            <ActivityIndicator size={size} color={color} style={styles.spinner} />
            {message && (
              <Text style={[styles.message, { color }]}>
                {message}
              </Text>
            )}
            {subMessage && (
              <Text style={[styles.subMessage, { color: COLORS.textLight }]}>
                {subMessage}
              </Text>
            )}
            {showProgress && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${displayProgress}%`, backgroundColor: color }]} />
              </View>
            )}
            {showProgress && progress > 0 && (
              <Text style={[styles.progressText, { color }]}>
                {Math.round(displayProgress)}%
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={[containerStyle_, containerStyle]}>
      {renderContent()}
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
  },
  minimalContainer: {
    padding: 10,
  },
  brandedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandedLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'CormorantGaramond',
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    marginTop: 8,
  },
});
