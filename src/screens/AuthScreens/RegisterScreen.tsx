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
import { getPasswordStrength } from '../../utils/validation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { logger } from '../../utils/logger';
import { FormInput } from '../../components/FormInput';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import { useFormValidation, ValidationRule } from '../../hooks/useFormValidation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const NAME_MIN_LENGTH = 2;

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const validationSchema: { [key: string]: ValidationRule } = {
    name: { required: true, minLength: NAME_MIN_LENGTH },
    email: { required: true, pattern: EMAIL_PATTERN },
    password: { required: true, minLength: PASSWORD_MIN_LENGTH },
    confirmPassword: { required: true },
  };

  const { validateForm, getFieldError } = useFormValidation(validationSchema);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('register');
      clearError();
      setRegistrationError(null);
      return () => {};
    }, [trackScreenView, clearError])
  );

  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    clearError();
    setRegistrationError(null);

    // Validate all fields
    const validationErrors = validateForm({ name, email, password, confirmPassword });
    
    if (Object.keys(validationErrors).length > 0) {
      showToast('Verifique todos os campos do formulário', 'error');
      trackEvent('register_validation_error', { errorCount: Object.keys(validationErrors).length });
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      showToast('As palavras-passe não correspondem', 'error');
      return;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      showToast('Deve concordar com os termos e condições', 'error');
      return;
    }

    try {
      logger.debug(`Attempting registration for ${email}`);
      await register(email, password, name);
      
      logger.debug(`Registration successful for ${email}`);
      showToast('Conta criada com sucesso! Inicie sessão para continuar.', 'success');
      trackEvent('register_success');
      
      // Navigate to login
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao criar conta';
      logger.error(`Registration failed: ${errorMessage}`, err as Error);
      setRegistrationError(errorMessage);
      showToast(errorMessage, 'error');
      trackEvent('register_error', { error: errorMessage });
    }
  };

  const handleLoginLink = () => {
    trackEvent('login_link_clicked');
    navigation.navigate('Login' as never);
  };

  const nameError = getFieldError('name');
  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');
  const confirmPasswordError = getFieldError('confirmPassword') || 
    (password !== confirmPassword && confirmPassword ? 'As palavras-passe não correspondem' : null);

  const passwordScore = passwordStrength?.score || 0;
  const passwordColor = passwordScore >= 4 ? COLORS.success : passwordScore >= 2 ? '#FFA500' : '#FF6B6B';

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
          <Text style={styles.headerTitle}>Criar Conta</Text>
          <Text style={styles.headerSubtitle}>Junte-se à nossa comunidade de bem-estar</Text>
        </LinearGradient>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <FormInput
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={nameError || undefined}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <FormInput
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Palavra-passe</Text>
            <FormInput
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError || undefined}
            />
            {password && (
              <View style={styles.passwordStrengthContainer}>
                <View style={[styles.strengthBar, { width: `${(passwordScore / 5) * 100}%`, backgroundColor: passwordColor }]} />
              </View>
            )}
            {password && (
              <Text style={[styles.strengthText, { color: passwordColor }]}>
                Força: {passwordStrength?.label}
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Palavra-passe</Text>
            <FormInput
              placeholder="Confirme sua palavra-passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmPasswordError || undefined}
            />
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <Checkbox
              checked={agreedToTerms}
              onChange={setAgreedToTerms}
              label="Concordo com os termos e condições"
              testID="terms-checkbox"
            />
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleRegister}
            disabled={isLoading || !agreedToTerms}
            loading={isLoading}
            variant="primary"
            size="large"
            style={{ marginTop: 20 }}
          >
            {isLoading ? 'A criar conta...' : 'Criar Conta'}
          </Button>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <TouchableOpacity onPress={handleLoginLink}>
            <Text style={styles.loginLink}>Inicie sessão aqui</Text>
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
  passwordStrengthContainer: {
    height: 4,
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    marginTop: 4,
    fontWeight: '500',
  },
  termsContainer: {
    marginVertical: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loginText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  loginLink: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
});
