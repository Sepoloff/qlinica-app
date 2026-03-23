import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/Colors';

interface OfflineQueueIndicatorProps {
  queueSize: number;
  isProcessing: boolean;
  isOnline: boolean;
  onRetry?: () => void;
  onClear?: () => void;
}

/**
 * Indicator component showing offline queue status
 * Displays number of pending operations and processing state
 */
export const OfflineQueueIndicator: React.FC<OfflineQueueIndicatorProps> = ({
  queueSize,
  isProcessing,
  isOnline,
  onRetry,
  onClear,
}) => {
  if (queueSize === 0) {
    return null;
  }

  const showIndicator = !isOnline || isProcessing;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isProcessing ? `${COLORS.gold}15` : `${COLORS.warning}15`,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.icon,
            {
              color: isProcessing ? COLORS.gold : COLORS.warning,
            },
          ]}
        >
          {isProcessing ? '⟳' : '⚠'}
        </Text>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.message,
              {
                color: isProcessing ? COLORS.gold : COLORS.warning,
              },
            ]}
          >
            {isProcessing
              ? `Sincronizando ${queueSize} operação${queueSize > 1 ? 's' : ''}...`
              : `${queueSize} operação${queueSize > 1 ? 's' : ''} aguardando sincronização`}
          </Text>
          {!isOnline && (
            <Text style={styles.subMessage}>Reconectar para sincronizar</Text>
          )}
        </View>
      </View>

      {(onRetry || onClear) && !isProcessing && (
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>Tentar</Text>
            </TouchableOpacity>
          )}
          {onClear && (
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={() => {
                Alert.alert(
                  'Limpar Fila',
                  'Tem certeza que deseja descartar as operações pendentes?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Descartar',
                      onPress: onClear,
                      style: 'destructive',
                    },
                  ]
                );
              }}
            >
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
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
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  subMessage: {
    fontSize: 11,
    color: COLORS.grey,
    marginTop: 2,
    fontFamily: 'DMSans',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  retryButton: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
});
