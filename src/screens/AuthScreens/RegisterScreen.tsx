'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useQuickToast } from '../../hooks/useToast';
import {
  validateEmail,
  validatePassword,
  validateName,
  getPasswordStrength,
} from '../../utils/validation';
import { FormInput } from '../../components/FormInput';
import { useFormValidation, emailRule, passwordRule, nameRule } from '../../hooks/useFormValidation';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();
  const toast = useQuickToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name) {
      setNameError('Nome é obrigatório');
      valid = false;
    } else if (!validateName(name)) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      valid = false;
    }

    if (!email) {
      setEmailError('Email é obrigatório');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      valid = false;
    }

    if (!password) {
      setPasswordError('Palavra-passe é obrigatória');
      valid = false;
    } else {
      const validation = validatePassword(password);
      if (!validation.valid) {
        setPasswordError(validation.errors[0]);
        valid = false;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirme a palavra-passe');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('As palavras-passe não correspondem');
      valid = false;
    }

    if (!agreedToTerms) {
      Alert.alert('Termos', 'Você precisa aceitar os termos e condições');
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await register(email, password, name);
      toast.success('✅ Conta criada com sucesso!');
      // Navigation will be handled by auth context changes
    } catch (err: any) {
      toast.error(`❌ ${err.message || 'Falha ao registrar'}`);
    }
  };

  const getStrengthColor = () => {
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
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Name Input */}
          <FormInput
            label="Nome Completo"
            placeholder="João da Silva"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            error={nameError}
            autoCapitalize="words"
            editable={!isLoading}
          />

          {/* Email Input */}
          <FormInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Password Input */}
          <View>
            <FormInput
              label="Palavra-passe"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              secureTextEntry={true}
              editable={!isLoading}
            />
            {password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthIndicator,
                      {
                        width: `${(passwordStrength.score / 5) * 100}%`,
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
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            error={confirmPasswordError}
            secureTextEntry={true}
            editable={!isLoading}
          />

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Concordo com os{' '}
              <Text style={styles.termsLink}>Termos e Condições</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primaryDark} />
            ) : (
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Já tem conta?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login' as never)}
            >
              Inicie sessão
            </Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
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
    marginBottom: 18,
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'DMSans',
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
  },
  checkboxMark: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    flex: 1,
  },
  termsLink: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
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
  loginLink: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
