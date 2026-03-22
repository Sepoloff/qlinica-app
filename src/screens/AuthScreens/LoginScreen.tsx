'use strict';

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  LinearGradient,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

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
    } else if (password.length < 6) {
      setPasswordError('Palavra-passe deve ter pelo menos 6 caracteres');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Navigation will be handled by auth context changes
    } catch (err: any) {
      Alert.alert('Erro de Autenticação', err.message || 'Falha ao fazer login');
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.grey}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Palavra-passe</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua palavra-passe"
                placeholderTextColor={COLORS.grey}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.togglePasswordButton}
              >
                <Text style={styles.togglePasswordText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primaryDark} />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sessão</Text>
            )}
          </TouchableOpacity>

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
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
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
