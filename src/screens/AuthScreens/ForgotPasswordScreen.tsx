'use strict';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { useToast } from '../../context/ToastContext';
import { passwordResetService } from '../../services/passwordResetService';
import { validateEmail } from '../../utils/validation';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = validateEmail(email);

  const handleRequestReset = async () => {
    if (!isEmailValid) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await passwordResetService.requestReset(email);

      setSubmitted(true);
      showToast({
        message: 'Email de recuperação enviado com sucesso!',
        type: 'success',
      });

      // Navigate to reset code verification screen after 3 seconds
      setTimeout(() => {
        navigation.navigate('ResetPassword', { email });
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao solicitar recuperação de senha';
      setError(errorMessage);
      showToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar Senha</Text>
        </View>

        {/* Content Card */}
        <Card style={styles.card}>
          {!submitted ? (
            <>
              <Text style={styles.subtitle}>
                Insira o email associado à sua conta e enviaremos instruções para
                redefinir sua senha.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <FormInput
                  label="Email"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  icon="mail"
                />
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <Button
                label={isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                onPress={handleRequestReset}
                disabled={!isEmailValid || isLoading}
                variant="primary"
                loading={isLoading}
              />

              {/* Back to Login Link */}
              <TouchableOpacity
                onPress={handleBackToLogin}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>Voltar para Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success Message */}
              <View style={styles.successContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={COLORS.success}
                />
                <Text style={styles.successTitle}>Email Enviado!</Text>
                <Text style={styles.successMessage}>
                  Verifique seu email para as instruções de recuperação de senha.
                </Text>
                <Text style={styles.successHint}>
                  Se não recebeu o email, verifique a pasta de spam.
                </Text>
              </View>

              <Button
                label="Verificar Email"
                onPress={() => navigation.navigate('ResetPassword', { email })}
                variant="primary"
              />

              <Button
                label="Voltar para Login"
                onPress={handleBackToLogin}
                variant="secondary"
              />
            </>
          )}
        </Card>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Problemas? Entre em contato conosco em{' '}
            <Text style={styles.helpLink}>suporte@qlinica.com</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    fontFamily: 'CormorantGaramond',
  },
  card: {
    padding: 24,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.danger}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginTop: 16,
    fontFamily: 'CormorantGaramond',
  },
  successMessage: {
    fontSize: 14,
    color: '#B0BEC5',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  successHint: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  helpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#90A4AE',
    textAlign: 'center',
  },
  helpLink: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
