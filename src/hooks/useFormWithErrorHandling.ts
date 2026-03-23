/**
 * Enhanced form hook with integrated error handling
 * Combines form validation with automatic error notifications
 */

import { useState, useCallback, useRef } from 'react';
import { useErrorNotification } from './useErrorNotification';
import { logger } from '../utils/logger';

export interface FormFieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface UseFormWithErrorHandlingOptions {
  /** Show validation errors as toast (default: false) */
  showValidationToasts?: boolean;
  /** Duration for validation toast errors (default: 3000) */
  validationToastDuration?: number;
  /** Log errors (default: true) */
  logErrors?: boolean;
}

export const useFormWithErrorHandling = <T extends Record<string, string>>(
  initialValues: T,
  validators: Record<keyof T, (value: string) => string | null>,
  options: UseFormWithErrorHandlingOptions = {}
) => {
  const {
    showValidationToasts = false,
    validationToastDuration = 3000,
    logErrors = true,
  } = options;

  const { notifyValidationError } = useErrorNotification();
  const [fields, setFields] = useState<Record<keyof T, FormFieldState>>(() => {
    const initial = {} as Record<keyof T, FormFieldState>;
    (Object.keys(initialValues) as Array<keyof T>).forEach((key) => {
      initial[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
      };
    });
    return initial;
  });

  const validationState = useRef<Record<keyof T, string | null>>({});

  /**
   * Update field value and validate
   */
  const updateField = useCallback(
    (fieldName: keyof T, value: string) => {
      const validator = validators[fieldName];
      const error = validator ? validator(value) : null;

      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          value,
          error,
          touched: true,
        },
      }));

      validationState.current[fieldName] = error;
    },
    [validators]
  );

  /**
   * Mark field as touched
   */
  const touchField = useCallback((fieldName: keyof T) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async (): Promise<boolean> => {
    let hasErrors = false;
    const newFields = { ...fields };

    (Object.keys(validators) as Array<keyof T>).forEach((fieldName) => {
      const validator = validators[fieldName];
      const value = fields[fieldName].value;
      const error = validator ? validator(value) : null;

      if (error) {
        hasErrors = true;
        if (logErrors) {
          logger.debug(`Field validation error: ${String(fieldName)} - ${error}`);
        }
      }

      newFields[fieldName] = {
        ...newFields[fieldName],
        error,
        touched: true,
      };

      validationState.current[fieldName] = error;
    });

    setFields(newFields);

    // Show toast if requested and there are errors
    if (hasErrors && showValidationToasts) {
      const firstError = (Object.values(newFields) as FormFieldState[]).find((f) => f.error);
      if (firstError) {
        notifyValidationError(firstError.error);
      }
    }

    return !hasErrors;
  }, [fields, validators, showValidationToasts, validationToastDuration, logErrors, notifyValidationError]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    const initial = {} as Record<keyof T, FormFieldState>;
    (Object.keys(initialValues) as Array<keyof T>).forEach((key) => {
      initial[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
      };
    });
    setFields(initial);
    validationState.current = {} as Record<keyof T, string | null>;
  }, [initialValues]);

  /**
   * Get form values
   */
  const getValues = useCallback((): T => {
    const values = {} as T;
    (Object.keys(fields) as Array<keyof T>).forEach((key) => {
      values[key] = fields[key].value;
    });
    return values;
  }, [fields]);

  /**
   * Check if form is valid
   */
  const isValid = useCallback((): boolean => {
    return !Object.values(validationState.current).some((error) => error !== null);
  }, []);

  /**
   * Get specific field state
   */
  const getField = useCallback(
    (fieldName: keyof T) => {
      return fields[fieldName];
    },
    [fields]
  );

  return {
    // State
    fields,
    
    // Methods
    updateField,
    touchField,
    validateAll,
    reset,
    getValues,
    isValid,
    getField,
    
    // Computed
    hasErrors: Object.values(fields).some((f) => f.error !== null),
    isDirty: Object.values(fields).some((f) => f.value !== initialValues[Object.keys(initialValues).indexOf(Object.keys(fields)[0]) as keyof T]),
  };
};
