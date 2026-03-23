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
import { getPasswordStrength, validateName, validatePhone } from '../../utils/validation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useScreenPerformance, useAsyncPerformance } from '../../hooks/usePerformanceTracking';
import { logger } from '../../utils/logger';
import { FormField } from '../../components/FormField';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { OperationStatus } from '../../components/OperationStatus';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  const { state, execute, error: asyncError, reset } = useAsyncOperation<void>();
  
  // Performance tracking
  const { getRenderCount } = useScreenPerformance({
    screenName: 'RegisterScreen',
    logToConsole: __DEV__,
  });
  const { trackOperation } = useAsyncPerformance('auth:register');

  // Validation setup
  const { fields, updateField, validateAll, hasErrors, reset: resetValidation } = useRealTimeValidation(
    {
      name: (value) => {
        if (!value) return 'Nome é obrigatório';
        if (!validateName(value)) return 'Nome deve ter pelo menos 2 caracteres';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email é obrigatório';
        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return null;
      },
      phone: (value) => {
        if (!value) return 'Telefone é obrigatório';
        if (!validatePhone(value)) return 'Telefone português inválido (9XX XXX XXX)';
        return null;
      },
      password: (value) => {
        if (!value) return 'Senha é obrigatória';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        if (!/[A-Z]/.test(value)) return 'Deve conter uma letra maiúscula';
        if (!/\d/.test(value)) return 'Deve conter um número';
        return null;
      },
      confirmPassword: (value) => {
        if (!value) return 'Confirmação de senha é obrigatória';
        if (value !== fields.password.value) return 'As senhas não correspondem';
        return null;
      },
    },
    300
  );

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('register');
      clearError();
      return () => {};
    }, [trackScreenView, clearError])
  );

  const passwordStrength = getPasswordStrength(fields.password.value);

  const handleRegister = useCallback(async () => {
    reset();

    // Validate all fields
    const isValid = await validateAll();
    if (!isValid) {
      showToast('Verifique todos os campos do formulário', 'error');
      trackEvent('register_validation_error');
      return;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      showToast('Deve concordar com os termos e condições', 'error');
      return;
    }

    // Execute registration with performance tracking
    await execute(async () => {
      await trackOperation(
        async () => {
          logger.debug(`Attempting registration for ${fields.email.value}`);
          await register(fields.email.value, fields.password.value, fields.name.value);
          logger.debug(`Registration successful for ${fields.email.value}`);
          showToast('Conta criada com sucesso! Iniciando sessão...', 'success');
          trackEvent('register_success');
          return null;
        },
        { email: fields.email.value }
      );
    });
  }, [
    reset,
    validateAll,
    showToast,
    trackEvent,
    agreedToTerms,
    execute,
    fields.email.value,
    fields.password.value,
    fields.name.value,
    register,
  ]);

  const handleLogin = () => {
    trackEvent('login_link_clicked');
    navigation.navigate('Login' as never);
  };

  const isLoading = state === 'loading';
  const buttonDisabled =
    isLoading ||
    hasErrors ||
    !agreedToTerms ||
    !fields.name.value ||
    !fields.email.value ||
    !fields.phone.value ||
    !fields.password.value ||
    !fields.confirmPassword.value;

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
          <Text style={styles.headerSubtitle}>Junte-se à comunidade Qlinica</Text>
        </LinearGradient>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Operation Status */}
          {state !== 'idle' && (
            <OperationStatus
              state={state}
              message="Criando sua conta..."
              errorMessage={asyncError?.message || 'Falha ao criar conta'}
              onRetry={handleRegister}
              onDismiss={reset}
            />
          )}

          {/* Name Field */}
          <FormField
            label="Nome Completo"
            placeholder="João Silva"
            value={fields.name.value}
            onChangeText={(text) => updateField('name', text)}
            error={fields.name.isTouched ? fields.name.error : null}
            isValidating={fields.name.isValidating}
            isValid={fields.name.value.length > 0 && !fields.name.error}
            editable={!isLoading}
            required
            showValidation
          />

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

          {/* Phone Field */}
          <FormField
            label="Telefone"
            placeholder="9XX XXX XXX"
            value={fields.phone.value}
            onChangeText={(text) => updateField('phone', text)}
            error={fields.phone.isTouched ? fields.phone.error : null}
            isValidating={fields.phone.isValidating}
            isValid={fields.phone.value.length > 0 && !fields.phone.error}
            keyboardType="phone-pad"
            editable={!isLoading}
            required
            showValidation
            helperText="Número de telefone português"
          />

          {/* Password Field */}
          <View>
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

            {/* Password Strength Indicator */}
            {fields.password.value.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor:
                          passwordStrength.strength === 'weak'
                            ? COLORS.danger
                            : passwordStrength.strength === 'medium'
                            ? COLORS.gold
                            : COLORS.success,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    {
                      color:
                        passwordStrength.strength === 'weak'
                          ? COLORS.danger
                          : passwordStrength.strength === 'medium'
                          ? COLORS.gold
                          : COLORS.success,
                    },
                  ]}
                >
                  Força: {passwordStrength.strength === 'weak' ? 'Fraca' : passwordStrength.strength === 'medium' ? 'Média' : 'Forte'}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Field */}
          <FormField
            label="Confirmar Senha"
            placeholder="••••••••"
            value={fields.confirmPassword.value}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={fields.confirmPassword.isTouched ? fields.confirmPassword.error : null}
            isValidating={fields.confirmPassword.isValidating}
            isValid={fields.confirmPassword.value.length > 0 && !fields.confirmPassword.error}
            secureTextEntry
            editable={!isLoading}
            required
            showValidation
          />

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <Checkbox
              checked={agreedToTerms}
              onValueChange={setAgreedToTerms}
              disabled={isLoading}
            />
            <Text style={styles.termsText}>
              Concordo com os{' '}
              <Text style={styles.termsLink}>Termos e Condições</Text>
            </Text>
          </View>

          {/* Register Button */}
          <Button
            title={isLoading ? 'Criando conta...' : 'Criar Conta'}
            onPress={handleRegister}
            disabled={buttonDisabled}
            loading={isLoading}
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <Text style={styles.loginLink}>Inicie sessão aqui</Text>
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
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#34495E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    flex: 1,
  },
  termsLink: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#34495E',
  },
  loginText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  loginLink: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
