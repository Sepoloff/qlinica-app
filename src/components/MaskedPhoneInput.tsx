import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { formatPhoneNumber, parsePhoneNumber } from '../utils/formatters';

interface MaskedPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Phone input with automatic formatting
 * Format: +351 XXX XXX XXX
 */
export const MaskedPhoneInput: React.FC<MaskedPhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = '+351 912 345 678',
  editable = true,
  onFocus,
  onBlur,
}) => {
  const handleChange = (text: string) => {
    // Extract only digits and +
    const parsed = parsePhoneNumber(text);
    
    // If it's a valid length, format it
    if (parsed.length <= 12) {
      // Ensure it starts with +351 for Portuguese numbers
      let formatted = parsed;
      if (parsed.length > 0 && !parsed.startsWith('+')) {
        formatted = formatted.slice(0, 9); // Keep only 9 digits for Portuguese
      }
      
      // Format and pass back to parent
      const fullFormatted = formatPhoneNumber(formatted);
      onChangeText(fullFormatted);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#8895a0"
        keyboardType="phone-pad"
        editable={editable}
        onFocus={onFocus}
        onBlur={onBlur}
        maxLength={19} // +351 XXX XXX XXX
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#34495E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#E8E8E8',
    backgroundColor: '#1a252f',
  },
  inputDisabled: {
    backgroundColor: '#34495E',
    color: '#8895a0',
  },
});
