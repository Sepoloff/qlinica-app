/**
 * useForm Hook
 * Manages form state, validation, and submission
 */

import { useState, useCallback, useRef } from 'react';

export interface FormField {
  value: string | number | boolean;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  [key: string]: FormField | string | number | boolean;
}

export interface UseFormReturn<T extends FormState> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => () => Promise<void>;
  resetForm: () => void;
  setValues: (values: Partial<T>) => void;
}

export const useForm = <T extends FormState>(
  initialValues: T,
  validate?: (values: T) => Record<keyof T, string | undefined>
): UseFormReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | undefined>>({} as any);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValuesRef = useRef(initialValues);

  // Check if form is dirty
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValuesState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setFieldValue(field, value);
      // Clear error when field is changed
      if (errors[field]) {
        setFieldError(field, '');
      }
    },
    [setFieldValue, errors, setFieldError]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field, true);
      
      // Validate on blur if validator provided
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[field]) {
          setFieldError(field, fieldErrors[field]);
        }
      }
    },
    [setFieldTouched, validate, values, setFieldError]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void>) =>
      async () => {
        try {
          setIsSubmitting(true);

          // Validate all fields
          let formErrors: Record<keyof T, string | undefined> = {} as any;
          if (validate) {
            formErrors = validate(values);
            setErrors(formErrors);

            // Check if there are any errors
            const hasErrors = Object.values(formErrors).some((error) => error);
            if (hasErrors) {
              setIsSubmitting(false);
              return;
            }
          }

          // Mark all fields as touched
          const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {} as Record<keyof T, boolean>
          );
          setTouched(allTouched);

          // Call submit handler
          await onSubmit(values);

          // Reset form on success
          setValuesState(initialValuesRef.current);
          setTouched({} as any);
          setErrors({} as any);
        } catch (error) {
          // Error handling is done in the onSubmit handler
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      },
    [validate, values]
  );

  const resetForm = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrors({} as any);
    setTouched({} as any);
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
};
