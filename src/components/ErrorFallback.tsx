'use strict';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface ErrorFallbackProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  icon?: string;
  style?: ViewStyle;
}

/**
 * Reusable error display component with retry and dismiss options
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = true,
  icon = '⚠️',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          {showRetry && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {showDismiss && onDismiss && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  dismissButton: {
    flex: 1,
    backgroundColor: `${COLORS.danger}20`,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
    fontFamily: 'DMSans',
  },
});
