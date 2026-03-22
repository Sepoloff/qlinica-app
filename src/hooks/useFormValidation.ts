'use strict';

import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule | ValidationRule[];
}

interface FieldErrors {
  [key: string]: string | null;
}

interface FormValidationState {
  errors: FieldErrors;
  hasErrors: boolean;
  touched: { [key: string]: boolean };
}

export const useFormValidation = (rules: ValidationRules) => {
  const [state, setState] = useState<FormValidationState>({
    errors: {},
    hasErrors: false,
    touched: {},
  });

  const validateField = useCallback(
    (fieldName: string, value: string): string | null => {
      const fieldRules = rules[fieldName];
      if (!fieldRules) return null;

      const rulesToCheck = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      for (const rule of rulesToCheck) {
        // Check required
        if (rule.required && (!value || value.trim() === '')) {
          return rule.message || `${fieldName} é obrigatório`;
        }

        if (value) {
          // Check minLength
          if (rule.minLength && value.length < rule.minLength) {
            return rule.message || `Mínimo ${rule.minLength} caracteres`;
          }

          // Check maxLength
          if (rule.maxLength && value.length > rule.maxLength) {
            return rule.message || `Máximo ${rule.maxLength} caracteres`;
          }

          // Check pattern
          if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message || `${fieldName} é inválido`;
          }

          // Check custom validation
          if (rule.custom && !rule.custom(value)) {
            return rule.message || `${fieldName} é inválido`;
          }
        }
      }

      return null;
    },
    [rules]
  );

  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [fieldName]: null, // Clear error on change
        },
      }));
    },
    []
  );

  const handleFieldBlur = useCallback(
    (fieldName: string, value: string) => {
      const error = validateField(fieldName, value);
      setState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [fieldName]: error,
        },
        touched: {
          ...prevState.touched,
          [fieldName]: true,
        },
      }));
    },
    [validateField]
  );

  const validateForm = useCallback(
    (formData: { [key: string]: string }): boolean => {
      const newErrors: FieldErrors = {};

      Object.keys(rules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName] || '');
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      const hasErrors = Object.values(newErrors).some((error) => error !== null);

      setState({
        errors: newErrors,
        hasErrors,
        touched: Object.keys(rules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ),
      });

      return !hasErrors;
    },
    [rules, validateField]
  );

  const clearErrors = useCallback(() => {
    setState({
      errors: {},
      hasErrors: false,
      touched: {},
    });
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setState((prevState) => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [fieldName]: error,
      },
      hasErrors: error !== null || Object.values(prevState.errors).some((e) => e !== null),
    }));
  }, []);

  return {
    errors: state.errors,
    touched: state.touched,
    hasErrors: state.hasErrors,
    validateField,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    clearErrors,
    setFieldError,
  };
};
