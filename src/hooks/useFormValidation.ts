'use strict';

/**
 * useFormValidation Hook
 * Provides real-time form validation with debouncing and field-level error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

export interface ValidationRule {
  validate: (value: string) => boolean | string; // true/false or error message
  debounceMs?: number;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

export interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  isValidating: boolean;
  isValid: boolean;
}

export interface FormValidationState {
  [fieldName: string]: FieldState;
}

interface UseFormValidationReturn {
  fields: FormValidationState;
  setFieldValue: (fieldName: string, value: string) => void;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  validateField: (fieldName: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: (initialValues?: Record<string, string>) => void;
  getFieldProps: (fieldName: string) => {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
  };
  isFormValid: boolean;
  isDirty: boolean;
}

export const useFormValidation = (
  initialValues: Record<string, string>,
  rules: ValidationRules
): UseFormValidationReturn => {
  const [fields, setFields] = useState<FormValidationState>(() => {
    const initialState: FormValidationState = {};
    Object.keys(initialValues).forEach((key) => {
      initialState[key] = {
        value: initialValues[key],
        error: null,
        touched: false,
        isValidating: false,
        isValid: true,
      };
    });
    return initialState;
  });

  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const isDirtyRef = useRef(false);

  // Validate a single field
  const validateField = useCallback(
    async (fieldName: string): Promise<boolean> => {
      const fieldRules = rules[fieldName];
      if (!fieldRules) {
        return true;
      }

      setFields((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], isValidating: true },
      }));

      const fieldValue = fields[fieldName].value;
      const rulesToCheck = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      let error: string | null = null;

      for (const rule of rulesToCheck) {
        const result = rule.validate(fieldValue);
        if (result !== true) {
          error = typeof result === 'string' ? result : `${fieldName} é inválido`;
          break;
        }
      }

      const isValid = error === null;

      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error,
          isValid,
          isValidating: false,
        },
      }));

      return isValid;
    },
    [fields, rules]
  );

  // Update field value with debounced validation
  const setFieldValue = useCallback(
    (fieldName: string, value: string) => {
      isDirtyRef.current = true;

      setFields((prev) => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], value },
      }));

      // Clear previous debounce timer
      if (debounceTimersRef.current[fieldName]) {
        clearTimeout(debounceTimersRef.current[fieldName]);
      }

      // Set new debounce timer
      const rule = rules[fieldName];
      const debounceMs = Array.isArray(rule) ? rule[0]?.debounceMs ?? 300 : rule?.debounceMs ?? 300;

      debounceTimersRef.current[fieldName] = setTimeout(() => {
        validateField(fieldName);
      }, debounceMs);
    },
    [rules, validateField]
  );

  // Mark field as touched
  const setFieldTouched = useCallback((fieldName: string, touched: boolean) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], touched },
    }));
  }, []);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(rules);
    const validationPromises = fieldNames.map((fieldName) => validateField(fieldName));

    const results = await Promise.all(validationPromises);
    return results.every((result) => result === true);
  }, [rules, validateField]);

  // Reset form to initial values
  const resetForm = useCallback((initialValues?: Record<string, string>) => {
    const resetValues: FormValidationState = {};

    const valuesToUse = initialValues || initialValues;
    Object.keys(rules).forEach((key) => {
      resetValues[key] = {
        value: valuesToUse?.[key] || '',
        error: null,
        touched: false,
        isValidating: false,
        isValid: true,
      };
    });

    setFields(resetValues);
    isDirtyRef.current = false;

    // Clear all debounce timers
    Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer));
    debounceTimersRef.current = {};
  }, [rules]);

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: fields[fieldName]?.value || '',
      onChangeText: (text: string) => setFieldValue(fieldName, text),
      onBlur: () => setFieldTouched(fieldName, true),
    }),
    [fields, setFieldValue, setFieldTouched]
  );

  // Check if entire form is valid
  const isFormValid = Object.values(fields).every((field) => field.isValid);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return {
    fields,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    getFieldProps,
    isFormValid,
    isDirty: isDirtyRef.current,
  };
};
