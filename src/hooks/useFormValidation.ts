/**
 * useFormValidation
 * Handles form field validation with real-time error messages
 */

import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormErrors {
  [key: string]: string | null;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const useFormValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const rule = schema[fieldName];
      
      if (!rule) return null;

      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return `${fieldName} é obrigatório`;
      }

      // Min length validation
      if (rule.minLength && value?.length < rule.minLength) {
        return `${fieldName} deve ter pelo menos ${rule.minLength} caracteres`;
      }

      // Max length validation
      if (rule.maxLength && value?.length > rule.maxLength) {
        return `${fieldName} não pode exceder ${rule.maxLength} caracteres`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return `${fieldName} está em formato inválido`;
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          return typeof customResult === 'string' ? customResult : `${fieldName} está inválido`;
        }
      }

      return null;
    },
    [schema]
  );

  const validateForm = useCallback(
    (values: { [key: string]: any }): FormErrors => {
      const newErrors: FormErrors = {};

      Object.keys(schema).forEach((fieldName) => {
        const error = validateField(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      logger.debug('Form validation', { fieldCount: Object.keys(schema).length, errors: newErrors });
      return newErrors;
    },
    [schema, validateField]
  );

  const handleBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
    },
    []
  );

  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [touched, validateField]
  );

  const getFieldError = (fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] : null;
  };

  const getFieldAttrs = (fieldName: string) => ({
    onBlur: () => handleBlur(fieldName),
    onChange: (value: any) => handleChange(fieldName, value),
    error: getFieldError(fieldName),
    touched: touched[fieldName],
  });

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    handleChange,
    getFieldError,
    getFieldAttrs,
    reset: () => {
      setErrors({});
      setTouched({});
    },
  };
};
