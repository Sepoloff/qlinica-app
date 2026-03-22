import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  rightIcon?: React.ReactNode;
}

/**
 * Reusable form input component with validation display
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onFocus,
  onBlur,
  rightIcon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View
        style={[
          styles.inputWrapper,
          isFocused ? styles.inputWrapperFocused : null,
          error ? styles.inputWrapperError : null,
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
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
        />

        {rightIcon ? (
          rightIcon
        ) : secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        ) : null}
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
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#E8E8E8',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34495E',
    borderRadius: 12,
    backgroundColor: '#1a252f',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold,
    backgroundColor: '#1f2d3d',
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}10`,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#E8E8E8',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputMultiline: {
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#34495E',
    color: '#8895a0',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: COLORS.danger,
    marginTop: 6,
  },
});
