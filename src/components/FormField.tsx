'use strict';

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { COLORS } from '../constants/Colors';

export interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * Enhanced form field component with validation display,
 * error messages, hints, and optional icons
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  required = false,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onBlur,
  onFocus,
  icon,
  rightElement,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const isSecure = secureTextEntry && !showPassword;
  const hasError = !!error;
  const isValid = value.length > 0 && !hasError;

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {isValid && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Input Wrapper */}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
          isValid && styles.inputWrapperValid,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            icon ? styles.inputWithIcon : {},
          ] as any}
          placeholder={placeholder}
          placeholderTextColor="#8895a0"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Password toggle or right element */}
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        ) : (
          rightElement && <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Hint */}
      {hint && !hasError && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>💡 {hint}</Text>
        </View>
      )}

      {/* Character count for limited input */}
      {maxLength && value.length > maxLength * 0.7 && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8E8E8',
    fontFamily: 'DMSans',
  },
  required: {
    color: '#DC3545',
  },
  checkmark: {
    fontSize: 16,
    color: '#28A745',
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34495E',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#34495E',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold,
    backgroundColor: '#3D536B',
  },
  inputWrapperError: {
    borderColor: '#DC3545',
    backgroundColor: '#4A3A3A',
  },
  inputWrapperValid: {
    borderColor: '#28A745',
  },
  inputWrapperDisabled: {
    backgroundColor: '#2C3E50',
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: '#E8E8E8',
    fontSize: 14,
    fontFamily: 'DMSans',
    paddingVertical: 12,
  },
  inputWithIcon: {
    marginLeft: 4,
  },
  inputMultiline: {
    paddingVertical: 10,
    maxHeight: 120,
  },
  toggleButton: {
    padding: 8,
    marginLeft: 4,
  },
  toggleText: {
    fontSize: 18,
  },
  rightElement: {
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  hintContainer: {
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#8895a0',
    fontFamily: 'DMSans',
    fontStyle: 'italic',
  },
  charCount: {
    fontSize: 11,
    color: '#8895a0',
    fontFamily: 'DMSans',
    marginTop: 4,
    textAlign: 'right',
  },
});
