import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/formValidator';

export interface UseFormValidatorOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Custom hook for form validation
 */
export const useFormValidator = (
  options: UseFormValidatorOptions = {}
) => {
  const { validateOnChange = false, validateOnBlur = true } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      // Simple validation logic
      if (!value) return `${fieldName} is required`;
      return null;
    },
    []
  );

  const validateForm = useCallback(
    (values: Record<string, any>): ValidationResult => {
      const newErrors: Record<string, string> = {};
      
      Object.keys(values).forEach(fieldName => {
        const error = validateField(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    [validateField]
  );

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
          return newErrors;
        });
      }
    },
    [validateOnChange, validateField]
  );

  const handleFieldBlur = useCallback(
    (fieldName: string, value: any) => {
      handleBlur(fieldName);
      if (validateOnBlur) {
        const error = validateField(fieldName, value);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
          return newErrors;
        });
      }
    },
    [validateOnBlur, validateField, handleBlur]
  );

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleFieldBlur,
    reset,
    hasErrors: Object.keys(errors).length > 0,
  };
};
