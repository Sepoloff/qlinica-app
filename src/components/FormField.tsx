import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  isValidating?: boolean;
  isValid?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  helperText?: string;
  required?: boolean;
  characterCount?: boolean;
  showValidation?: boolean;
}

/**
 * Enhanced form field component with real-time validation feedback
 * Shows validation state (validating, valid, error) with animated transitions
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  isValidating = false,
  isValid = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onFocus,
  onBlur,
  helperText,
  required = false,
  characterCount = false,
  showValidation = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = error && error.length > 0;
  const showSuccess = isValid && !hasError && value.length > 0;

  const borderColor =
    hasError ? COLORS.danger : isFocused ? COLORS.gold : showSuccess ? COLORS.success : '#34495E';

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
        {characterCount && maxLength && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
          },
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#8895a0"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Validation Icons */}
        {showValidation && !secureTextEntry && (
          <View style={styles.rightIcons}>
            {isValidating && (
              <Text style={styles.validatingIcon}>⟳</Text>
            )}
            {!isValidating && hasError && (
              <Text style={styles.errorIcon}>✕</Text>
            )}
            {!isValidating && showSuccess && (
              <Text style={styles.successIcon}>✓</Text>
            )}
          </View>
        )}

        {/* Password toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleIcon}>
              {showPassword ? '👁' : '👁‍🗨'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Helper text */}
      {helperText && !hasError && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  required: {
    color: COLORS.danger,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: '#1a252f',
    paddingHorizontal: 12,
    borderColor: '#34495E',
  },
  inputWrapperFocused: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: '#1f3a48',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputDisabled: {
    opacity: 0.5,
    color: COLORS.grey,
  },
  rightIcons: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingIcon: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  errorIcon: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  successIcon: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  passwordToggle: {
    padding: 8,
    marginLeft: 8,
  },
  passwordToggleIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.danger,
    marginTop: 4,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: COLORS.grey,
    marginTop: 4,
    fontFamily: 'DMSans',
  },
});
