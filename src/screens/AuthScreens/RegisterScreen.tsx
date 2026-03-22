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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPasswordStrength, validatePassword } from '../../utils/validation';
import { useAnalytics } from '../../hooks/useAnalytics';
import { logger } from '../../utils/logger';
import { FormInput } from '../../components/FormInput';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import { useFormValidation, emailRule, passwordRule, nameRule } from '../../hooks/useFormValidation';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('register');
      clearError();
      setRegistrationError(null);
      return () => {};
    }, [trackScreenView, clearError])
  );

  // Use form validation hook
  const {
    values,
    errors,
    touched,
    setFieldValue,
    validateForm,
    resetForm,
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      name: nameRule,
      email: emailRule,
      password: passwordRule,
      confirmPassword: {
        validate: (value: string) => {
          if (!value) return 'Confirmação obrigatória';
          if (value !== values.password) return 'As palavras-passe não correspondem';
          return null;
        },
      },
    },
  });

  const passwordStrength = getPasswordStrength(values.password);

  const handleRegister = async () => {
    clearError();
    setRegistrationError(null);

    const formIsValid = await validateForm();
    if (!formIsValid) {
      showToast({
        type: 'error',
        title: 'Validação',
        message: 'Verifique todos os campos do formulário',
      });
      trackEvent('register_validation_error');
      return;
    }

    if (!agreedToTerms) {
      showToast({
        type: 'error',
        title: 'Termos e Condições',
        message: 'Por favor aceite os termos e condições',
      });
      trackEvent('register_terms_not_accepted');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(values.password);
    if (!passwordValidation.valid) {
      setRegistrationError(passwordValidation.errors[0]);
      showToast({
        type: 'error',
        title: 'Palavra-passe fraca',
        message: passwordValidation.errors[0],
      });
      trackEvent('register_weak_password');
      return;
    }

    try {
      logger.debug(`Attempting registration for ${values.email}`, 'RegisterScreen');
      await register(values.email, values.password, values.name);
      
      logger.debug(`Registration successful for ${values.email}`, 'RegisterScreen');
      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Conta criada com sucesso!',
      });
      trackEvent('register_success');
      resetForm();
      // Navigation handled by auth context
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao registrar';
      logger.error(`Registration failed: ${errorMessage}`, err, 'RegisterScreen');
      setRegistrationError(errorMessage);
      
      showToast({
        type: 'error',
        title: 'Erro de Registro',
        message: errorMessage,
      });

      trackEvent('register_error', { 
        errorType: err.response?.status || 'unknown',
      });
    }
  };

  const getStrengthColor = () => {
    if (!values.password) return COLORS.grey;
    if (passwordStrength.strength === 'weak') return '#E74C3C';
    if (passwordStrength.strength === 'medium') return '#FFB84D';
    return '#4CAF50';
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>
            <Text style={{ color: COLORS.gold }}>Q</Text>linica
          </Text>
          <Text style={styles.subtitle}>Crie sua conta</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <FormInput
            label="Nome Completo"
            placeholder="João da Silva"
            value={values.name}
            onChangeText={(text) => setFieldValue('name', text)}
            error={touched.name ? errors.name : ''}
            autoCapitalize="words"
            editable={!isLoading}
          />

          {/* Email Input */}
          <FormInput
            label="Email"
            placeholder="seu@email.com"
            value={values.email}
            onChangeText={(text) => setFieldValue('email', text)}
            error={touched.email ? errors.email : ''}
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Password Input */}
          <View>
            <FormInput
              label="Palavra-passe"
              placeholder="Mínimo 8 caracteres"
              value={values.password}
              onChangeText={(text) => setFieldValue('password', text)}
              error={touched.password ? errors.password : ''}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              }
            />

            {/* Password Strength */}
            {values.password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${Math.min(100, passwordStrength.score * 25)}%` as any,
                        backgroundColor: getStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  Força: {passwordStrength.strength}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <FormInput
            label="Confirmar Palavra-passe"
            placeholder="Repita a palavra-passe"
            value={values.confirmPassword}
            onChangeText={(text) => setFieldValue('confirmPassword', text)}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            }
          />

          {/* Terms Checkbox */}
          <View style={styles.termsSection}>
            <Checkbox
              label={
                <Text style={styles.termsText}>
                  Concordo com os{' '}
                  <Text style={styles.termsLink}>Termos e Condições</Text>
                </Text>
              }
              checked={agreedToTerms}
              onPress={(value) => setAgreedToTerms(value)}
            />
          </View>

          {/* Register Button */}
          <Button
            label={isLoading ? 'Registrando...' : 'Criar Conta'}
            onPress={handleRegister}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Inicie sessão</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'CormorantGaramond',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grey,
    marginTop: 8,
    fontFamily: 'DMSans',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: `${COLORS.gold}10`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans',
    textTransform: 'capitalize',
  },
  eyeIcon: {
    fontSize: 18,
  },
  termsSection: {
    marginVertical: 20,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.white,
    lineHeight: 20,
    fontFamily: 'DMSans',
  },
  termsLink: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  registerButton: {
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
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
