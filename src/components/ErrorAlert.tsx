/**
 * Error display component with retry capability
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  onRetry,
  showRetry = true,
  type = 'error',
}) => {
  if (!error) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#FFA50020',
          borderColor: '#FFA500',
          iconColor: '#FFA500',
          icon: '⚠️',
        };
      case 'info':
        return {
          backgroundColor: '#0099FF20',
          borderColor: '#0099FF',
          iconColor: '#0099FF',
          icon: 'ℹ️',
        };
      case 'error':
      default:
        return {
          backgroundColor: '#E74C3C20',
          borderColor: '#E74C3C',
          iconColor: '#E74C3C',
          icon: '❌',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: typeStyles.backgroundColor, borderColor: typeStyles.borderColor },
      ]}
    >
      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.icon, { color: typeStyles.iconColor }]}>
          {typeStyles.icon}
        </Text>
        <Text style={styles.message} numberOfLines={4}>
          {error}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onRetry && showRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>🔄 Tentar</Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    lineHeight: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 8,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFA50040',
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    color: COLORS.grey,
    fontWeight: '700',
  },
});
