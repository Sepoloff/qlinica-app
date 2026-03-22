'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { logger } from '../../utils/logger';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const { errors, validateField: validateFormField, hasErrors } = useFormValidation({
    email: { required: true, pattern: 'email' },
    password: { required: true, minLength: 8 },
  });

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('login');
      clearError();
      return () => {};
    }, [trackScreenView, clearError])
  );

  const handleLogin = async () => {
    // Rate limiting check
    if (isRateLimited) {
      showToast({
        type: 'error',
        title: 'Demasiadas tentativas',
        message: 'Aguarde alguns minutos antes de tentar novamente',
      });
      return;
    }

    clearError();
    const validationErrors = validate({ email, password });
    
    if (Object.keys(validationErrors).length > 0) {
      showToast({
        type: 'error',
        title: 'Validação',
        message: 'Verifique os campos do formulário',
      });
      trackEvent('login_validation_error', { errorCount: Object.keys(validationErrors).length });
      return;
    }

    try {
      logger.debug(`Attempting login for ${email}`, 'LoginScreen');
      await login(email, password);
      
      logger.debug(`Login successful for ${email}`, 'LoginScreen');
      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Login realizado com sucesso',
      });
      trackEvent('login_success');
      
      // Navigation will be handled by auth context changes
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao fazer login';
      logger.error(`Login failed: ${errorMessage}`, err, 'LoginScreen');
      
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Rate limit after 5 failed attempts
      if (newAttempts >= 5) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setLoginAttempts(0);
        }, 60000); // 1 minute lockout
      }

      showToast({
        type: 'error',
        title: 'Erro de Login',
        message: errorMessage,
      });

      trackEvent('login_error', { 
        errorType: err.response?.status || 'unknown',
        attempts: newAttempts,
      });
    }
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
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.logo}>
            <Text style={{ color: COLORS.gold }}>Q</Text>linica
          </Text>
          <Text style={styles.subtitle}>Bem-vindo de volta</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Email Input */}
          <FormInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateFieldValue('email', text);
            }}
            error={errors.email}
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Password Input */}
          <FormInput
            label="Palavra-passe"
            placeholder="Sua palavra-passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              validateFieldValue('password', text);
            }}
            error={errors.password}
            secureTextEntry={true}
            editable={!isLoading}
          />

          {/* Rate limit warning */}
          {isRateLimited && (
            <View style={styles.rateLimitWarning}>
              <Text style={styles.rateLimitText}>
                ⏱️ Demasiadas tentativas. Tente novamente em 1 minuto.
              </Text>
            </View>
          )}

          {/* Login Button */}
          <Button
            label={isLoading ? 'Iniciando sessão...' : 'Iniciar Sessão'}
            disabled={isLoading || isRateLimited || !isValid}
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Esqueceu a palavra-passe?</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ainda não tem conta?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register' as never)}
            >
              Registre-se aqui
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  rateLimitWarning: {
    backgroundColor: `${COLORS.danger}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  rateLimitText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Cormorant',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  errorBanner: {
    backgroundColor: `#E74C3C20`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#E74C3C',
    fontFamily: 'DMSans',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.white,
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
    fontFamily: 'DMSans',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  passwordContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontSize: 14,
  },
  togglePasswordButton: {
    paddingHorizontal: 12,
  },
  togglePasswordText: {
    fontSize: 16,
  },
  fieldError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'DMSans',
    marginTop: 6,
  },
  loginButton: {
    marginTop: 24,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  registerLink: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
