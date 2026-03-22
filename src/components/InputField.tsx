'use strict';

import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

export type InputType = 'text' | 'email' | 'password' | 'phone' | 'number';

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: InputType;
  label?: string;
  error?: string;
  disabled?: boolean;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

/**
 * Reusable Input Field Component
 * 
 * Handles various input types with validation error display
 * 
 * @example
 * <InputField
 *   label="E-mail"
 *   placeholder="seu@email.com"
 *   type="email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 * />
 */
export const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  type = 'text',
  label,
  error,
  disabled = false,
  icon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  maxLength,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getSecureTextEntry = () => {
    return type === 'password' && !showPassword;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ] as ViewStyle}
      >
        {icon && (
          <Text style={styles.leftIcon}>{icon}</Text>
        )}

        <TextInput
          style={[
            styles.input,
            icon ? { paddingLeft: 0 } : {},
            inputStyle,
          ] as any}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grey}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          keyboardType={getKeyboardType()}
          secureTextEntry={getSecureTextEntry()}
          multiline={multiline}
          maxLength={maxLength}
        />

        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.rightIcon}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !error && type !== 'password' && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}

        {error && (
          <Text style={styles.errorIcon}>⚠️</Text>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}05`,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}05`,
  },
  inputWrapperDisabled: {
    backgroundColor: `${COLORS.grey}10`,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: COLORS.white,
    paddingVertical: 8,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rightIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: COLORS.gold,
  },
  errorIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontFamily: 'DMSans',
    marginTop: 4,
  },
});
