/**
 * Enhanced Login Screen
 * With JWT integration, advanced validation, and error handling
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { validateEmail, validatePassword } from '../../utils/validation';
import { logger } from '../../utils/logger';

import { EnhancedFormField } from '../../components/EnhancedFormField';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const EMAIL_RFC5322 = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default function LoginScreenEnhanced() {
  const navigation = useNavigation();
  const { login: authLogin, clearError, error: authError, isLoading } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  const { state: loginState, execute } = useAsyncOperation<void>();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('login_enhanced');
      clearError();
      return () => {};
    }, [trackScreenView, clearError])
  );

  const handleLogin = useCallback(async () => {
    // Validate rate limiting
    if (isRateLimited) {
      showToast('🔒 Demasiadas tentativas. Aguarde alguns minutos.', 'error');
      return;
    }

    // Validate form
    if (!email || !password) {
      showToast('❌ Preencha todos os campos', 'error');
      trackEvent('login_missing_fields');
      return;
    }

    if (!emailValid) {
      showToast('❌ Email inválido', 'error');
      trackEvent('login_invalid_email');
      return;
    }

    if (!passwordValid) {
      showToast('❌ Senha inválida', 'error');
      trackEvent('login_invalid_password');
      return;
    }

    clearError();

    try {
      await execute(async () => {
        logger.debug('Attempting login', { email });
        await authLogin(email.toLowerCase().trim(), password);

        // Success
        setLoginAttempts(0);
        trackEvent('login_success');
        showToast('✅ Login bem-sucedido!', 'success');

        // Navigate (will be handled by AuthContext navigation logic)
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      
      // Track failed attempt
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Apply rate limiting after 3 failed attempts
      if (newAttempts >= 3) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setLoginAttempts(0);
        }, 60000); // Reset after 1 minute
      }

      trackEvent('login_failure', {
        error: errorMessage,
        attempts: newAttempts,
      });

      logger.warn('Login failed', { error: errorMessage, attempts: newAttempts });
    }
  }, [email, password, emailValid, passwordValid, isRateLimited, loginAttempts, authLogin, clearError, execute, trackEvent, showToast]);

  const canSubmit = emailValid && passwordValid && !isLoading && loginState !== 'loading' && !isRateLimited;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner
          fullScreen
          variant="branded"
          message="Carregando..."
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.primary, `${COLORS.primary}E0`]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>Q</Text>
            </View>
            <Text style={styles.title}>Qlinica</Text>
            <Text style={styles.subtitle}>Agendamento de Consultas</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Error State */}
            {authError && (
              <ErrorState
                error={authError}
                onRetry={() => clearError()}
                title="Erro ao Fazer Login"
                variant="alert"
              />
            )}

            {/* Rate Limited */}
            {isRateLimited && (
              <ErrorState
                error="Demasiadas tentativas. Tente novamente em alguns minutos."
                title="Acesso Limitado"
                variant="alert"
              />
            )}

            {/* Email Field */}
            <EnhancedFormField
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              pattern={EMAIL_RFC5322}
              patternErrorMessage="Email inválido"
              onValidationChange={setEmailValid}
              icon="📧"
              required
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !isRateLimited}
            />

            {/* Password Field */}
            <EnhancedFormField
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              toggleSecureEntry
              minLength={8}
              onValidationChange={setPasswordValid}
              icon="🔐"
              required
              editable={!isLoading && !isRateLimited}
              helperText="Mínimo 8 caracteres"
            />

            {/* Submit Button */}
            <Button
              onPress={handleLogin}
              title={loginState === 'loading' ? 'Carregando...' : 'Entrar'}
              disabled={!canSubmit}
              loading={loginState === 'loading'}
              fullWidth
              style={styles.loginButton}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta?</Text>
            <TouchableOpacity
              onPress={() => {
                trackEvent('navigate_to_register');
                navigation.navigate('Register' as never);
              }}
            >
              <Text style={styles.footerLink}>Registre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'CormorantGaramond',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'CormorantGaramond',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: `${COLORS.white}CC`,
    fontFamily: 'DMSans',
  },
  formContainer: {
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginButton: {
    marginTop: 24,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: `${COLORS.white}BB`,
    fontFamily: 'DMSans',
    marginRight: 6,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
