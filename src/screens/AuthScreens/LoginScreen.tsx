'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState } from 'react';
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
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useFormValidation, ValidationRule } from '../../hooks/useFormValidation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { logger } from '../../utils/logger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const validationSchema: { [key: string]: ValidationRule } = {
    email: { required: true, pattern: EMAIL_PATTERN },
    password: { required: true, minLength: PASSWORD_MIN_LENGTH },
  };
  
  const { errors, validateForm, getFieldError } = useFormValidation(validationSchema);

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
      showToast('Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente', 'error');
      return;
    }

    clearError();
    const validationErrors = validateForm({ email, password });
    
    if (Object.keys(validationErrors).length > 0) {
      showToast('Verifique os campos do formulário', 'error');
      trackEvent('login_validation_error', { errorCount: Object.keys(validationErrors).length });
      return;
    }

    try {
      logger.debug(`Attempting login for ${email}`);
      await login(email, password);
      
      logger.debug(`Login successful for ${email}`);
      showToast('Login realizado com sucesso!', 'success');
      trackEvent('login_success');
      
      // Navigation will be handled by auth context changes
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao fazer login';
      logger.error(`Login failed: ${errorMessage}`, err as Error);
      
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

      showToast(errorMessage, 'error');
      trackEvent('login_error', { attempts: newAttempts, error: errorMessage });
    }
  };

  const handleForgotPassword = () => {
    trackEvent('forgot_password_clicked');
    navigation.navigate('ForgotPassword' as never);
  };

  const handleRegister = () => {
    trackEvent('register_clicked');
    navigation.navigate('Register' as never);
  };

  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');

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
          {/* Email Input */}
          <FormInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError || undefined}
          />

          {/* Password Input */}
          <FormInput
            label="Palavra-passe"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError || undefined}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordLink}>Esqueceu a palavra-passe?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            title={isLoading ? 'A iniciar sessão...' : 'Iniciar Sessão'}
            onPress={handleLogin}
            disabled={isLoading || isRateLimited}
            loading={isLoading}
            variant="primary"
            size="large"
            style={{ marginTop: 20 }}
          />
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Ainda não tem conta? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerLink}>Registe-se aqui</Text>
          </TouchableOpacity>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Cormorant',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  registerText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  registerLink: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
});
