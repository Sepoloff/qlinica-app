'use strict';

import { useState, useCallback } from 'react';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateLoginForm,
  validateRegisterForm,
  validateBookingForm,
  validateProfileForm,
  ValidationResult,
} from '../utils/formValidator';

interface UseFormValidationResult {
  errors: Record<string, string>;
  validateField: (fieldName: string, value: string) => string | null;
  validateForm: (formType: string, data: any) => ValidationResult;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
}

/**
 * Hook for managing form validation
 * 
 * @example
 * const { errors, validateField, validateForm } = useFormValidation();
 * 
 * const handleEmailChange = (email: string) => {
 *   setEmail(email);
 *   validateField('email', email);
 * };
 */
export const useFormValidation = (): UseFormValidationResult => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((fieldName: string, value: string): string | null => {
    let error: string | null = null;

    switch (fieldName) {
      case 'email':
        error = validateEmail(value) ? null : 'E-mail inválido';
        break;
      case 'password':
        const passwordCheck = validatePassword(value);
        error = passwordCheck.isStrong ? null : passwordCheck.message;
        break;
      case 'phone':
        error = validatePhone(value) ? null : 'Número de telefone inválido';
        break;
      case 'name':
        error = validateName(value) ? null : 'Nome deve ter pelo menos 2 caracteres';
        break;
      default:
        error = value ? null : 'Campo obrigatório';
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    return error;
  }, []);

  const validateForm = useCallback((formType: string, data: any): ValidationResult => {
    let result: ValidationResult;

    switch (formType) {
      case 'login':
        result = validateLoginForm(data.email || '', data.password || '');
        break;
      case 'register':
        result = validateRegisterForm(
          data.email || '',
          data.password || '',
          data.name || '',
          data.phone
        );
        break;
      case 'booking':
        result = validateBookingForm(data.serviceId, data.therapistId, data.date, data.time);
        break;
      case 'profile':
        result = validateProfileForm(data.name, data.phone, data.email);
        break;
      default:
        result = { isValid: true, errors: {} };
    }

    setErrors(result.errors);
    return result;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  };
};
