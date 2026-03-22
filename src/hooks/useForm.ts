import { useState, useCallback } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  validate?: (values: T) => FormErrors;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    // Validate single field
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: validationErrors[field],
        }));
      }
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async () => {
    // Validate all fields
    let validationErrors: FormErrors = {};
    if (validate) {
      validationErrors = validate(values);
      setErrors(validationErrors);
    }

    // Mark all fields as touched
    const touchedAll: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      touchedAll[key] = true;
    });
    setTouched(touchedAll);

    // If there are errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit if no errors
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue: (field: keyof T, value: any) => handleChange(field, value),
    setFieldError: (field: string, error: string) => {
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    },
    setFieldTouched: (field: string, isTouched: boolean) => {
      setTouched(prev => ({
        ...prev,
        [field]: isTouched,
      }));
    },
  };
};
