'use strict';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { useToast } from '../../context/ToastContext';
import { passwordResetService } from '../../services/passwordResetService';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showToast } = useToast();

  const email = route.params?.email || '';

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'token' | 'password'>('token');

  const passwordStrength = passwordResetService.getPasswordStrengthFeedback(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = passwordsMatch && passwordStrength.strength === 'strong';

  const handleVerifyToken = async () => {
    if (!resetToken.trim()) {
      setError('Por favor, insira o código de recuperação');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await passwordResetService.verifyToken(resetToken);

      if (result.valid) {
        setStep('password');
        showToast('Código verificado com sucesso!', 'success');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Código inválido ou expirado';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isFormValid) {
      setError('Preencha todos os campos corretamente');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await passwordResetService.confirmReset({
        token: resetToken,
        newPassword,
        confirmPassword,
      });

      showToast({
        message: 'Senha alterada com sucesso!',
        type: 'success',
      });

      // Navigate back to login after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao redefinir senha';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.title}>Redefinir Senha</Text>
        </View>

        <Card style={styles.card}>
          {step === 'token' ? (
            // Token Verification Step
            <>
              <Text style={styles.subtitle}>
                Insira o código de recuperação enviado para:
              </Text>
              <Text style={styles.emailText}>{email}</Text>

              <View style={styles.inputContainer}>
                <FormInput
                  label="Código de Recuperação"
                  placeholder="123456"
                  value={resetToken}
                  onChangeText={(text) => {
                    setResetToken(text);
                    setError(null);
                  }}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title={isLoading ? 'Verificando...' : 'Verificar Código'}
                onPress={handleVerifyToken}
                disabled={!resetToken.trim() || isLoading}
                variant="primary"
                loading={isLoading}
              />

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>Não recebeu o código?</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Password Reset Step
            <>
              <Text style={styles.subtitle}>Crie uma nova senha segura</Text>

              <View style={styles.inputContainer}>
                <FormInput
                  label="Nova Senha"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={COLORS.gold}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {newPassword && (
                <PasswordStrengthIndicator
                  password={newPassword}
                  style={styles.strengthIndicator}
                />
              )}

              <View style={styles.inputContainer}>
                <FormInput
                  label="Confirmar Senha"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={COLORS.gold}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {newPassword && confirmPassword && !passwordsMatch && (
                <View style={styles.warningContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
                  <Text style={styles.warningText}>As senhas não correspondem</Text>
                </View>
              )}

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                label={isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                onPress={handleResetPassword}
                disabled={!isFormValid || isLoading}
                variant="primary"
                loading={isLoading}
              />

              <TouchableOpacity
                onPress={() => setStep('token')}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>Usar outro código</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
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
    marginBottom: 12,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: COLORS.warning,
    marginLeft: 8,
    fontSize: 13,
  },
  strengthIndicator: {
    marginBottom: 16,
  },
  iconButton: {
    padding: 8,
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
});
