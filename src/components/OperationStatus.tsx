import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';
import { LoadingSpinner } from './LoadingSpinner';

interface OperationStatusProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Reusable component for showing operation status
 * Handles loading, success, and error states with visual feedback
 */
export const OperationStatus: React.FC<OperationStatusProps> = ({
  state,
  message,
  errorMessage,
  onRetry,
  onDismiss,
}) => {
  if (state === 'idle') {
    return null;
  }

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  const backgroundColor = isSuccess
    ? `${COLORS.success}15`
    : isError
    ? `${COLORS.danger}15`
    : `${COLORS.gold}15`;

  const borderColor = isSuccess
    ? COLORS.success
    : isError
    ? COLORS.danger
    : COLORS.gold;

  const textColor = isSuccess
    ? COLORS.success
    : isError
    ? COLORS.danger
    : COLORS.gold;

  const icon = isLoading ? null : isSuccess ? '✓' : isError ? '✕' : '⚠';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <LoadingSpinner size="small" color={COLORS.gold} />
        ) : (
          <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.message,
              {
                color: textColor,
              },
            ]}
          >
            {isLoading
              ? message || 'Processando...'
              : isSuccess
              ? message || 'Operação concluída com sucesso'
              : errorMessage || 'Ocorreu um erro'}
          </Text>
        </View>
      </View>

      {(isError || isSuccess) && (onRetry || onDismiss) && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={isError && onRetry ? onRetry : onDismiss}
        >
          <Text style={[styles.actionText, { color: textColor }]}>
            {isError && onRetry ? 'Tentar novamente' : 'Fechar'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'DMSans',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
