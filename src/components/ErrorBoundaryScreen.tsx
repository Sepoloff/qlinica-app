/**
 * ErrorBoundaryScreen
 * Graceful error handling with retry functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { Button } from './Button';
import { logger } from '../utils/logger';

interface ErrorBoundaryScreenProps {
  error: Error;
  onRetry: () => void;
  onGoHome: () => void;
  title?: string;
}

export const ErrorBoundaryScreen: React.FC<ErrorBoundaryScreenProps> = ({
  error,
  onRetry,
  onGoHome,
  title = 'Oops! Algo correu mal',
}) => {
  React.useEffect(() => {
    logger.error('Error rendered in ErrorBoundaryScreen', error);
  }, [error]);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Desculpe, ocorreu um erro inesperado.</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>Detalhes do erro:</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          
          {__DEV__ && (
            <View style={styles.devInfo}>
              <Text style={styles.devLabel}>Stack Trace (Dev only):</Text>
              <Text style={styles.stackTrace}>{error.stack}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="🔄 Tentar Novamente"
            onPress={onRetry}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="🏠 Ir para Início"
            onPress={onGoHome}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>O que pode tentar:</Text>
          <Text style={styles.helpItem}>• Verificar a ligação à internet</Text>
          <Text style={styles.helpItem}>• Fechar e reabrir a aplicação</Text>
          <Text style={styles.helpItem}>• Contactar suporte se o problema persistir</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'CormorantGaramond',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'center',
    fontFamily: 'DMSans',
  },
  content: {
    padding: 20,
  },
  errorBox: {
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
    lineHeight: 18,
  },
  devInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  devLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffb366',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  stackTrace: {
    fontSize: 10,
    color: '#ccc',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  actions: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  helpBox: {
    backgroundColor: 'rgba(212, 175, 143, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: 12,
    fontFamily: 'DMSans',
  },
  helpItem: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
});
