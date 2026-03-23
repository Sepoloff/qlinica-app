'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { OperationStatus } from '../../components/OperationStatus';
import { logger } from '../../utils/logger';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  const { state, execute, error: asyncError, reset } = useAsyncOperation<void>();

  // Validation setup
  const { fields, updateField, validateAll, hasErrors, reset: resetValidation } = useRealTimeValidation(
    {
      email: (value) => {
        if (!value) return 'Email é obrigatório';
        if (!validateEmail(value)) return 'Email inválido';
        return null;
      },
      password: (value) => {
        if (!value) return 'Senha é obrigatória';
        const validation = validatePassword(value);
        if (!validation.valid) return validation.errors[0];
        return null;
      },
    },
    300
  );

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('login');
      clearError();
      return () => {};
    }, [trackScreenView, clearError])
  );

  const handleLogin = useCallback(async () => {
    // Rate limiting check
    if (isRateLimited) {
      showToast('Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente', 'error');
      return;
    }

    reset();

    // Validate all fields
    const isValid = await validateAll();
    if (!isValid) {
      showToast('Verifique os campos do formulário', 'error');
      trackEvent('login_validation_error');
      return;
    }

    // Execute login
    await execute(async () => {
      logger.debug(`Attempting login for ${fields.email.value}`);
      await login(fields.email.value, fields.password.value);
      logger.debug(`Login successful for ${fields.email.value}`);
      showToast('Login realizado com sucesso!', 'success');
      trackEvent('login_success');
    });

    // Handle rate limiting on error
    if (state === 'error') {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setLoginAttempts(0);
        }, 60000);
      }

      trackEvent('login_error', { attempts: newAttempts });
    }
  }, [
    isRateLimited,
    showToast,
    reset,
    validateAll,
    execute,
    fields.email.value,
    fields.password.value,
    login,
    trackEvent,
    loginAttempts,
    state,
  ]);

  const handleForgotPassword = () => {
    trackEvent('forgot_password_clicked');
    navigation.navigate('ForgotPassword' as never);
  };

  const handleRegister = () => {
    trackEvent('register_clicked');
    navigation.navigate('Register' as never);
  };

  const isLoading = state === 'loading';
  const buttonDisabled = isLoading || hasErrors || !fields.email.value || !fields.password.value;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Bem-vindo à Qlinica</Text>
          <Text style={styles.headerSubtitle}>Inicie sessão para continuar</Text>
        </LinearGradient>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Operation Status */}
          {state !== 'idle' && (
            <OperationStatus
              state={state}
              message="Iniciando sessão..."
              errorMessage={asyncError?.message || 'Falha ao fazer login'}
              onRetry={handleLogin}
              onDismiss={reset}
            />
          )}

          {/* Email Field */}
          <FormField
            label="Email"
            placeholder="seu@email.com"
            value={fields.email.value}
            onChangeText={(text) => updateField('email', text)}
            error={fields.email.isTouched ? fields.email.error : null}
            isValidating={fields.email.isValidating}
            isValid={fields.email.value.length > 0 && !fields.email.error}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            required
            showValidation
          />

          {/* Password Field */}
          <FormField
            label="Senha"
            placeholder="••••••••"
            value={fields.password.value}
            onChangeText={(text) => updateField('password', text)}
            error={fields.password.isTouched ? fields.password.error : null}
            isValidating={fields.password.isValidating}
            isValid={fields.password.value.length > 0 && !fields.password.error}
            secureTextEntry
            editable={!isLoading}
            required
            showValidation
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title={isLoading ? 'Iniciando sessão...' : 'Iniciar Sessão'}
            onPress={handleLogin}
            disabled={buttonDisabled}
            loading={isLoading}
            style={styles.loginButton}
          />

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
              <Text style={styles.registerLink}>Registre-se aqui</Text>
            </TouchableOpacity>
          </View>
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  loginButton: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#34495E',
  },
  registerText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  registerLink: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
