import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/Colors';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  editable?: boolean;
  multiline?: boolean;
  maxLength?: number;
  testID?: string;
  icon?: string;
  onIconPress?: () => void;
  showCharCount?: boolean;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  touched = false,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  multiline = false,
  maxLength,
  testID,
  icon,
  onIconPress,
  showCharCount = false,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  const hasError = touched && error;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  const charCount = maxLength && showCharCount ? `${value.length}/${maxLength}` : null;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {charCount && (
          <Text
            style={[
              styles.charCount,
              value.length >= maxLength! * 0.9 && styles.charCountWarning,
            ]}
          >
            {charCount}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <TouchableOpacity onPress={onIconPress} disabled={!onIconPress}>
            <Text style={styles.icon}>{icon}</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grey}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          maxLength={maxLength}
          testID={testID}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconButton}
          >
            <Text style={styles.eyeIcon}>
              {hidePassword ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
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
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  required: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  charCountWarning: {
    color: COLORS.gold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}20`,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}05`,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}08`,
  },
  inputContainerDisabled: {
    backgroundColor: `${COLORS.grey}15`,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    padding: 0,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
    fontFamily: 'DMSans',
  },
});
