/**
 * Enhanced Form Field Component
 * Includes validation feedback, icons, and loading states
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/Colors';

type ValidationState = 'idle' | 'validating' | 'valid' | 'error';

interface EnhancedFormFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  validationState?: ValidationState;
  showValidationIcon?: boolean;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
  toggleSecureEntry?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternErrorMessage?: string;
  onValidationChange?: (isValid: boolean) => void;
  required?: boolean;
  requiredMessage?: string;
}

/**
 * Enhanced Form Field with integrated validation
 * 
 * Features:
 * - Real-time validation feedback
 * - Pattern matching
 * - Min/Max length validation
 * - Secure text entry toggle
 * - Loading state during validation
 * - Animated error messages
 * 
 * @example
 * <EnhancedFormField
 *   label="Email"
 *   placeholder="seu@email.com"
 *   pattern={EMAIL_REGEX}
 *   patternErrorMessage="Email inválido"
 *   onValidationChange={(valid) => setEmailValid(valid)}
 * />
 */
export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  placeholder,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  validationState = 'idle',
  showValidationIcon = true,
  containerStyle,
  secureTextEntry: initialSecureTextEntry = false,
  toggleSecureEntry = false,
  minLength,
  maxLength,
  pattern,
  patternErrorMessage,
  onValidationChange,
  required,
  requiredMessage = 'Este campo é obrigatório',
  value,
  onChangeText,
  ...props
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);
  const [internalValue, setInternalValue] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(error);
  const [validationState_, setValidationState] = useState<ValidationState>(validationState);
  const [errorOpacity] = useState(new Animated.Value(0));

  // Update internal value when prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      setInternalValue(value);
    }
  }, [value]);

  // Update error state when prop changes
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  // Animate error message
  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: localError ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [localError, errorOpacity]);

  const validateField = (text: string) => {
    let fieldError: string | null = null;

    if (required && !text.trim()) {
      fieldError = requiredMessage;
    } else if (minLength && text.length < minLength) {
      fieldError = `Mínimo ${minLength} caracteres`;
    } else if (maxLength && text.length > maxLength) {
      fieldError = `Máximo ${maxLength} caracteres`;
    } else if (pattern && !pattern.test(text)) {
      fieldError = patternErrorMessage || 'Formato inválido';
    }

    setLocalError(fieldError);
    setValidationState(fieldError ? 'error' : text.trim() ? 'valid' : 'idle');
    onValidationChange?.(fieldError === null);

    return fieldError === null;
  };

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    validateField(text);
    onChangeText?.(text);
  };

  const isError = localError !== null && localError !== undefined;
  const isValid = validationState_ === 'valid' && !isError;
  const isValidating = validationState_ === 'validating';

  const getBorderColor = () => {
    if (isError) return COLORS.danger;
    if (isValid) return COLORS.success;
    return COLORS.border;
  };

  const renderValidationIcon = () => {
    if (!showValidationIcon) return null;

    if (isValidating) {
      return (
        <View style={styles.rightIconContainer}>
          <Text style={styles.icon}>⟳</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.rightIconContainer}>
          <Text style={styles.errorIcon}>✕</Text>
        </View>
      );
    }

    if (isValid) {
      return (
        <View style={styles.rightIconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: isError ? `${COLORS.danger}08` : COLORS.surface,
          },
        ]}
      >
        {icon && <Text style={styles.leftIcon}>{icon}</Text>}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry}
          value={internalValue}
          onChangeText={handleChangeText}
          maxLength={maxLength}
          editable={validationState_ !== 'validating'}
          {...props}
        />

        {toggleSecureEntry && initialSecureTextEntry && (
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.rightIconContainer}
          >
            <Text style={styles.icon}>{secureTextEntry ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        )}

        {rightIcon && !toggleSecureEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <Text style={styles.icon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}

        {!rightIcon && !toggleSecureEntry && renderValidationIcon()}
      </View>

      {(helperText || localError) && (
        <Animated.View style={{ opacity: errorOpacity }}>
          {localError && (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>
              {localError}
            </Text>
          )}
          {!localError && helperText && (
            <Text style={[styles.helperText, { color: COLORS.textLight }]}>
              {helperText}
            </Text>
          )}
        </Animated.View>
      )}

      {maxLength && (
        <Text style={styles.charCount}>
          {internalValue.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
  required: {
    color: COLORS.danger,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: 'DMSans',
    paddingHorizontal: 8,
  },
  leftIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  rightIconContainer: {
    padding: 8,
    marginLeft: 4,
  },
  icon: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  errorIcon: {
    fontSize: 18,
    color: COLORS.danger,
  },
  successIcon: {
    fontSize: 18,
    color: COLORS.success,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    marginTop: 6,
    fontWeight: '400',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: 'DMSans',
    marginTop: 4,
    textAlign: 'right',
  },
});
