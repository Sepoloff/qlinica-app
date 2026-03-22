import { useState, useCallback } from 'react';
import { FormValidator, FormRule, FormValidationResult } from '../utils/formValidator';

export interface UseFormValidatorOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidator = (
  rules: Record<string, FormRule>,
  options: UseFormValidatorOptions = {}
) => {
  const { validateOnChange = false, validateOnBlur = true } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const fieldRule = rules[fieldName];
      if (!fieldRule) return null;

      const error = FormValidator.validateField(fieldName, value, fieldRule);
      return error ? error.message : null;
    },
    [rules]
  );

  const validateForm = useCallback(
    (values: Record<string, any>): FormValidationResult => {
      return FormValidator.validateForm(values, rules);
    },
    [rules]
  );

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || undefined,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  const handleFieldBlur = useCallback(
    (fieldName: string, value: any) => {
      handleBlur(fieldName);
      if (validateOnBlur) {
        const error = validateField(fieldName, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || undefined,
        }));
      }
    },
    [validateOnBlur, validateField, handleBlur]
  );

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleChange,
    handleBlur: handleFieldBlur,
    setFieldError,
    clearErrors,
    clearFieldError,
    resetForm,
    isValid: Object.keys(errors).length === 0,
  };
};
