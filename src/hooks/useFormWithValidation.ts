/**
 * useFormWithValidation Hook
 * Complete form management with real-time validation
 * Supports async validation, custom rules, and error handling
 */

import { useCallback, useState, useRef, useEffect } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null; // Return error message or null
  async?: (value: any) => Promise<string | null>; // For async validation
}

export interface FieldConfig {
  initialValue?: any;
  rules?: ValidationRule;
  dependencies?: string[]; // Re-validate when these fields change
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

interface UseFormReturn {
  values: Record<string, any>;
  errors: FormErrors;
  touched: FormTouched;
  isValidating: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  setFieldValue: (field: string, value: any) => Promise<void>;
  setFieldTouched: (field: string, touched: boolean) => void;
  setFieldError: (field: string, error: string | null) => void;
  validateField: (field: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => () => void;
  handleSubmit: (callback: (values: Record<string, any>) => Promise<void> | void) => () => Promise<void>;
  reset: (values?: Record<string, any>) => void;
  setFormError: (error: string) => void;
  formError: string | null;
}

const DEFAULT_VALIDATION_RULES: ValidationRule = {
  required: false,
};

export const useFormWithValidation = (
  initialValues: Record<string, any>,
  fieldConfigs: Record<string, FieldConfig> = {},
): UseFormReturn => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const initialValuesRef = useRef(initialValues);
  const validationTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Validate single field
  const validateField = useCallback(
    async (fieldName: string): Promise<boolean> => {
      const config = fieldConfigs[fieldName];
      const rules = config?.rules || DEFAULT_VALIDATION_RULES;
      const value = values[fieldName];

      let error: string | null = null;

      try {
        // Required validation
        if (rules.required && (value === undefined || value === null || value === '')) {
          error = `${fieldName} is required`;
        }

        // Length validation
        if (value && !error) {
          if (rules.minLength && String(value).length < rules.minLength) {
            error = `${fieldName} must be at least ${rules.minLength} characters`;
          }
          if (rules.maxLength && String(value).length > rules.maxLength) {
            error = `${fieldName} must not exceed ${rules.maxLength} characters`;
          }
        }

        // Pattern validation
        if (value && !error && rules.pattern) {
          if (!rules.pattern.test(String(value))) {
            error = `${fieldName} format is invalid`;
          }
        }

        // Custom sync validation
        if (value && !error && rules.custom) {
          error = rules.custom(value);
        }

        // Async validation
        if (value && !error && rules.async) {
          setIsValidating(true);
          error = await rules.async(value);
          setIsValidating(false);
        }
      } catch (err) {
        console.error(`Validation error for ${fieldName}:`, err);
        error = 'Validation failed';
      }

      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      return !error;
    },
    [values, fieldConfigs],
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const fieldNames = Object.keys(fieldConfigs);

    try {
      const results = await Promise.all(
        fieldNames.map((fieldName) => validateField(fieldName)),
      );

      setIsValidating(false);
      return results.every((result) => result === true);
    } catch (error) {
      console.error('Form validation error:', error);
      setIsValidating(false);
      return false;
    }
  }, [fieldConfigs, validateField]);

  // Set field value with debounced validation
  const setFieldValue = useCallback(
    async (field: string, value: any) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
      setIsDirty(true);

      // Debounce validation
      if (validationTimeoutRef.current[field]) {
        clearTimeout(validationTimeoutRef.current[field]);
      }

      const config = fieldConfigs[field];
      if (config?.rules) {
        validationTimeoutRef.current[field] = setTimeout(() => {
          validateField(field);
        }, 300);
      }
    },
    [fieldConfigs, validateField],
  );

  // Set field touched
  const setFieldTouched = useCallback((field: string, touched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: touched,
    }));

    // Validate on blur if touched
    if (touched) {
      validateField(field);
    }
  }, [validateField]);

  // Set field error manually
  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Handle change event
  const handleChange = useCallback(
    (field: string) => (value: any) => {
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  // Handle blur event
  const handleBlur = useCallback(
    (field: string) => () => {
      setFieldTouched(field, true);
    },
    [setFieldTouched],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (callback: (values: Record<string, any>) => Promise<void> | void) =>
      async () => {
        setFormError(null);

        try {
          const isValid = await validateForm();

          if (!isValid) {
            setFormError('Please fix the errors in the form');
            return;
          }

          setIsSubmitting(true);
          await callback(values);
          setIsSubmitting(false);
        } catch (error) {
          console.error('Form submission error:', error);
          setFormError(
            error instanceof Error ? error.message : 'An error occurred',
          );
          setIsSubmitting(false);
        }
      },
    [validateForm, values],
  );

  // Reset form
  const reset = useCallback((newValues?: Record<string, any>) => {
    const resetValues = newValues || initialValuesRef.current;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setFormError(null);

    // Clear validation timeouts
    Object.values(validationTimeoutRef.current).forEach((timeout) => {
      clearTimeout(timeout);
    });
    validationTimeoutRef.current = {};
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    values,
    errors,
    touched,
    isValidating,
    isSubmitting,
    isDirty,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFormError,
    formError,
  };
};
