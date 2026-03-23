/**
 * FormField Component
 * Reusable form field with integrated validation, error display, and styling
 */

import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text as RNText,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface FormFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | null;
  touched?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  required?: boolean;
  helper?: string;
  helperText?: string;
  icon?: React.ReactNode;
  onFocus?: () => void;
  isValidating?: boolean;
  isValid?: boolean;
  showValidation?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // Accessibility props
  accessibilityLabel?: string;
  testID?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines,
  maxLength,
  required = false,
  helper,
  helperText,
  icon,
  onFocus,
  isValidating = false,
  isValid = false,
  showValidation = false,
  autoCapitalize = 'none',
  accessibilityLabel,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const hasError = useMemo(() => touched && error, [touched, error]);
  const borderColor = useMemo(() => {
    if (hasError) return colors.danger;
    if (isFocused) return colors.gold;
    return colors.border;
  }, [hasError, isFocused, colors]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // Build accessibility label
  const a11yLabel = accessibilityLabel || `${label || 'Campo'}${required ? ', obrigatório' : ''}`;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <RNText style={[styles.label, { color: colors.text }]}>
            {label}
            {required && <RNText style={{ color: colors.danger }}>*</RNText>}
          </RNText>
          {maxLength && (
            <RNText
              style={[
                styles.characterCount,
                { color: value.length > maxLength * 0.8 ? colors.warning : colors.textSecondary },
              ]}
            >
              {value.length}/{maxLength}
            </RNText>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: isDark ? colors.offWhite : colors.white,
          },
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: icon ? 40 : 12,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={a11yLabel}
          accessibilityHint={error ? `Erro: ${error}` : helper || helperText}
          testID={testID}
        />
      </View>

      {hasError && (
        <RNText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </RNText>
      )}

      {(helper || helperText) && !hasError && (
        <RNText style={[styles.helperText, { color: colors.textSecondary }]}>
          {helper || helperText}
        </RNText>
      )}
    </View>
  );
};

export default FormField;

interface SelectOption {
  label: string;
  value: any;
}

interface FormSelectProps {
  label?: string;
  value: any;
  onValueChange: (value: any) => void;
  options: SelectOption[];
  error?: string | null;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  error,
  touched,
  placeholder = 'Select an option',
  required = false,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || placeholder;
  }, [value, options, placeholder]);

  const hasError = useMemo(() => touched && error, [touched, error]);

  return (
    <View style={styles.container}>
      {label && (
        <RNText style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <RNText style={{ color: colors.danger }}>*</RNText>}
        </RNText>
      )}

      <Pressable
        style={[
          styles.selectButton,
          {
            borderColor: hasError ? colors.danger : colors.border,
            backgroundColor: colors.offWhite,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <RNText
          style={[
            styles.selectButtonText,
            {
              color: value ? colors.text : colors.textSecondary,
            },
          ]}
        >
          {selectedLabel}
        </RNText>
        <RNText style={{ color: colors.textSecondary }}>▼</RNText>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.dropdownItem,
                {
                  backgroundColor:
                    value === option.value ? colors.gold : 'transparent',
                },
              ]}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              <RNText
                style={[
                  styles.dropdownItemText,
                  {
                    color:
                      value === option.value ? colors.white : colors.text,
                  },
                ]}
              >
                {option.label}
              </RNText>
            </Pressable>
          ))}
        </View>
      )}

      {hasError && (
        <RNText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </RNText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  characterCount: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingRight: 12,
    height: 48,
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingRight: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
