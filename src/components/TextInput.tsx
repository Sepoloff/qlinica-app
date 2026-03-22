import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { COLORS } from '../constants/Colors';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  error,
  icon,
  onChangeText,
  secureTextEntry,
  showPasswordToggle = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.inputContainerFocused : null,
          error ? styles.inputContainerError : null,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}

        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grey}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {secureTextEntry && showPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleIcon}>{showPassword ? '👁️' : '🚫'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}20`,
  },
  inputContainerFocused: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.primaryLight}cc`,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'DMSans',
  },
  toggleButton: {
    padding: 8,
  },
  toggleIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontFamily: 'DMSans',
    marginTop: 6,
  },
});
