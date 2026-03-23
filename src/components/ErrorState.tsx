/**
 * Error State Component
 * Displays error messages with retry functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface ErrorStateProps {
  error: string | Error | null;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
  variant?: 'alert' | 'card' | 'inline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullHeight?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Algo correu mal',
  subtitle,
  showIcon = true,
  variant = 'card',
  style,
  textStyle,
  fullHeight = false,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  const containerStyle = fullHeight ? styles.fullHeight : styles.container;

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <Text style={[styles.errorText, textStyle]}>
          {errorMessage}
        </Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButtonSmall}>
            <Text style={styles.retryTextSmall}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'alert') {
    return (
      <View style={[styles.alertContainer, style]}>
        {showIcon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
        )}
        <View style={styles.contentContainer}>
          <Text style={[styles.alertTitle, textStyle]}>{title}</Text>
          <Text style={styles.alertMessage}>{errorMessage}</Text>
          {subtitle && (
            <Text style={styles.alertSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
    );
  }

  // Default card variant
  return (
    <View style={[containerStyle, style]}>
      {showIcon && (
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>✕</Text>
        </View>
      )}
      <Text style={[styles.cardTitle, textStyle]}>{title}</Text>
      <Text style={styles.cardMessage}>{errorMessage}</Text>
      {subtitle && (
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      )}
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    marginVertical: 12,
  },
  fullHeight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.danger}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.danger}10`,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: `${COLORS.danger}30`,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.danger}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'DMSans',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'DMSans',
    marginTop: 8,
    fontStyle: 'italic',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
    marginBottom: 4,
    fontFamily: 'DMSans',
  },
  alertMessage: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'DMSans',
    lineHeight: 18,
  },
  alertSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: 'DMSans',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
    fontFamily: 'DMSans',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  retryButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.danger,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryTextSmall: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
