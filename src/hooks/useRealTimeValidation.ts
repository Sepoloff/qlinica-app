import { useState, useCallback, useEffect, useRef } from 'react';

type ValidationRule = (value: string) => string | null;

interface FieldValidationState {
  value: string;
  error: string | null;
  isTouched: boolean;
  isValidating: boolean;
}

interface UseRealTimeValidationResult {
  fields: Record<string, FieldValidationState>;
  updateField: (fieldName: string, value: string, validator?: ValidationRule) => void;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  validateField: (fieldName: string) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  reset: () => void;
  hasErrors: boolean;
}

/**
 * Hook for real-time form field validation with debounce
 * Supports async validators and automatic error clearing
 * 
 * @param validators - Map of field names to validation rules
 * @param debounceMs - Debounce delay for validation (default: 300ms)
 * 
 * @example
 * const { fields, updateField, validateAll, hasErrors } = useRealTimeValidation({
 *   email: (value) => {
 *     if (!value) return 'Email is required';
 *     if (!value.includes('@')) return 'Invalid email';
 *     return null;
 *   },
 *   password: (value) => {
 *     if (!value) return 'Password is required';
 *     if (value.length < 8) return 'Min 8 characters';
 *     return null;
 *   }
 * });
 */
export const useRealTimeValidation = (
  validators: Record<string, ValidationRule> = {},
  debounceMs: number = 300
): UseRealTimeValidationResult => {
  const [fields, setFields] = useState<Record<string, FieldValidationState>>({
    ...Object.keys(validators).reduce((acc, key) => {
      acc[key] = {
        value: '',
        error: null,
        isTouched: false,
        isValidating: false,
      };
      return acc;
    }, {} as Record<string, FieldValidationState>),
  });

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const hasErrors = Object.values(fields).some((field) => field.error !== null);

  const validateField = useCallback(
    async (fieldName: string): Promise<boolean> => {
      if (!validators[fieldName]) {
        return true;
      }

      setFields((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], isValidating: true },
      }));

      try {
        const validator = validators[fieldName];
        const fieldValue = fields[fieldName].value;
        const error = validator(fieldValue);

        setFields((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error, isValidating: false },
        }));

        return error === null;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Validation error';
        setFields((prev) => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: errorMsg, isValidating: false },
        }));
        return false;
      }
    },
    [validators, fields]
  );

  const updateField = useCallback(
    (fieldName: string, value: string, validator?: ValidationRule) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          isTouched: true,
        },
      }));

      // Clear existing debounce timer
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }

      // Set new debounce timer for validation
      debounceTimers.current[fieldName] = setTimeout(async () => {
        const validatorFn = validator || validators[fieldName];
        if (validatorFn && typeof validatorFn === 'function') {
          await validateField(fieldName);
        }
      }, debounceMs);
    },
    [debounceMs, validateField, validators]
  );

  const setFieldTouched = useCallback((fieldName: string, touched: boolean) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isTouched: touched },
    }));
  }, []);

  const validateAll = useCallback(async (): Promise<boolean> => {
    const results = await Promise.all(
      Object.keys(validators).map((fieldName) => validateField(fieldName))
    );
    return results.every((result) => result === true);
  }, [validators, validateField]);

  const reset = useCallback(() => {
    // Clear all timers
    Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    debounceTimers.current = {};

    // Reset state
    setFields(
      Object.keys(validators).reduce((acc, key) => {
        acc[key] = {
          value: '',
          error: null,
          isTouched: false,
          isValidating: false,
        };
        return acc;
      }, {} as Record<string, FieldValidationState>)
    );
  }, [validators]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return {
    fields,
    updateField,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
    hasErrors,
  };
};
