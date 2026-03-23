/**
 * Form Validation Helpers
 * Provides standardized, user-friendly validation functions
 */

import { validateEmail, validatePassword, validatePhone, validateName } from './validation';
import { MESSAGES } from '../constants/Messages';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate email field
 */
export const validateEmailField = (value: string): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: MESSAGES.VALIDATION.EMAIL_REQUIRED };
  }
  if (!validateEmail(value)) {
    return { valid: false, message: MESSAGES.VALIDATION.EMAIL_INVALID };
  }
  return { valid: true };
};

/**
 * Validate password field
 */
export const validatePasswordField = (value: string): ValidationResult => {
  if (!value) {
    return { valid: false, message: MESSAGES.VALIDATION.PASSWORD_REQUIRED };
  }
  const passwordValidation = validatePassword(value);
  if (!passwordValidation.valid) {
    return {
      valid: false,
      message: passwordValidation.errors[0] || MESSAGES.VALIDATION.PASSWORD_WEAK,
    };
  }
  return { valid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): ValidationResult => {
  if (!confirmation) {
    return { valid: false, message: 'Confirmação da senha é obrigatória' };
  }
  if (password !== confirmation) {
    return { valid: false, message: MESSAGES.VALIDATION.PASSWORD_MISMATCH };
  }
  return { valid: true };
};

/**
 * Validate name field
 */
export const validateNameField = (value: string): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: MESSAGES.VALIDATION.NAME_REQUIRED };
  }
  if (!validateName(value)) {
    return { valid: false, message: MESSAGES.VALIDATION.NAME_TOO_SHORT };
  }
  return { valid: true };
};

/**
 * Validate phone field
 */
export const validatePhoneField = (value: string): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: MESSAGES.VALIDATION.PHONE_REQUIRED };
  }
  if (!validatePhone(value)) {
    return { valid: false, message: MESSAGES.VALIDATION.PHONE_INVALID };
  }
  return { valid: true };
};

/**
 * Validate date field (not in past)
 */
export const validateDateField = (value: string): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: MESSAGES.VALIDATION.DATE_REQUIRED };
  }
  
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return { valid: false, message: MESSAGES.VALIDATION.DATE_PAST };
  }

  return { valid: true };
};

/**
 * Validate time field
 */
export const validateTimeField = (value: string): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: MESSAGES.VALIDATION.TIME_REQUIRED };
  }
  
  // Basic time format validation (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return { valid: false, message: 'Hora inválida (formato: HH:mm)' };
  }

  return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequiredField = (value: string, fieldName: string = 'Campo'): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }
  return { valid: true };
};

/**
 * Validate field length
 */
export const validateFieldLength = (
  value: string,
  minLength: number,
  maxLength?: number,
  fieldName: string = 'Campo'
): ValidationResult => {
  if (value.length < minLength) {
    return {
      valid: false,
      message: `${fieldName} deve ter pelo menos ${minLength} caracteres`,
    };
  }
  
  if (maxLength && value.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} não pode exceder ${maxLength} caracteres`,
    };
  }

  return { valid: true };
};

/**
 * Validate number field
 */
export const validateNumberField = (value: string, min?: number, max?: number): ValidationResult => {
  if (!value?.trim()) {
    return { valid: false, message: 'Número é obrigatório' };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: 'Deve ser um número válido' };
  }

  if (min !== undefined && num < min) {
    return { valid: false, message: `Deve ser maior ou igual a ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, message: `Deve ser menor ou igual a ${max}` };
  }

  return { valid: true };
};

/**
 * Validate select field
 */
export const validateSelectField = (value: string | null | undefined, fieldName: string = 'Campo'): ValidationResult => {
  if (!value) {
    return { valid: false, message: `Selecione ${fieldName}` };
  }
  return { valid: true };
};

/**
 * Validate checkbox (must be checked)
 */
export const validateCheckboxField = (checked: boolean, fieldName: string = 'Campo'): ValidationResult => {
  if (!checked) {
    return { valid: false, message: `Deve aceitar ${fieldName}` };
  }
  return { valid: true };
};

/**
 * Create custom validator
 */
export const createValidator = (
  validationFn: (value: string) => boolean,
  errorMessage: string
) => {
  return (value: string): ValidationResult => {
    if (!validationFn(value)) {
      return { valid: false, message: errorMessage };
    }
    return { valid: true };
  };
};
