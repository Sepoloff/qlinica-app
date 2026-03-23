/**
 * Advanced Validation Service
 * Centralized validation logic for forms with detailed feedback
 */

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateDate,
  getPasswordStrength,
} from '../utils/validation';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PasswordStrengthResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
}

/**
 * Login form validation
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: string[] = [];

  if (!email?.trim()) {
    errors.push('Email é obrigatório');
  } else if (!validateEmail(email)) {
    errors.push('Email inválido. Verifique o formato (ex: user@example.com)');
  }

  if (!password?.trim()) {
    errors.push('Senha é obrigatória');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Registration form validation
 */
export function validateRegistrationForm(
  email: string,
  password: string,
  name: string,
  passwordConfirm?: string
): ValidationResult {
  const errors: string[] = [];

  // Email validation
  if (!email?.trim()) {
    errors.push('Email é obrigatório');
  } else if (!validateEmail(email)) {
    errors.push('Email inválido. Use o formato: user@example.com');
  } else if (email.length > 254) {
    errors.push('Email é muito longo');
  }

  // Name validation
  if (!name?.trim()) {
    errors.push('Nome é obrigatório');
  } else if (!validateName(name)) {
    errors.push('Nome deve ter no mínimo 2 caracteres e não pode conter números');
  }

  // Password validation
  if (!password?.trim()) {
    errors.push('Senha é obrigatória');
  } else {
    const validation = validatePassword(password);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
  }

  // Password confirmation
  if (passwordConfirm && password !== passwordConfirm) {
    errors.push('Senhas não correspondem');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Booking form validation
 */
export function validateBookingForm(
  serviceId?: string | number,
  therapistId?: string | number,
  date?: Date,
  time?: string
): ValidationResult {
  const errors: string[] = [];

  if (!serviceId) {
    errors.push('Selecione um serviço');
  }

  if (!therapistId) {
    errors.push('Selecione um terapeuta');
  }

  if (!date) {
    errors.push('Selecione uma data');
  } else if (!validateDate(date)) {
    errors.push('Data não pode ser no passado');
  }

  if (!time) {
    errors.push('Selecione uma hora');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Profile update validation
 */
export function validateProfileUpdate(
  name?: string,
  phone?: string,
  email?: string
): ValidationResult {
  const errors: string[] = [];

  if (name && !validateName(name)) {
    errors.push('Nome inválido');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Número de telefone português inválido');
  }

  if (email && !validateEmail(email)) {
    errors.push('Email inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get detailed password strength feedback
 */
export function getPasswordStrengthFeedback(password: string): PasswordStrengthResult {
  const strength = getPasswordStrength(password);
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('Aumentar para no mínimo 8 caracteres');
  }
  if (password.length < 12) {
    feedback.push('12+ caracteres oferecem segurança melhorada');
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    feedback.push('Misturar maiúsculas e minúsculas');
  }
  if (!/\d/.test(password)) {
    feedback.push('Adicionar números');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Adicionar caracteres especiais para mais segurança');
  }

  return {
    ...strength,
    feedback: feedback.slice(0, 2), // Top 2 suggestions
  };
}

/**
 * Email validation with extended checks
 */
export function validateEmailExtended(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email?.trim()) {
    errors.push('Email é obrigatório');
  } else if (!validateEmail(email)) {
    errors.push('Email inválido');
  } else if (email.length > 254) {
    errors.push('Email é muito longo');
  } else if (email.includes(' ')) {
    errors.push('Email não pode conter espaços');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Phone validation with formatting suggestion
 */
export function validatePhoneExtended(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone?.trim()) {
    errors.push('Telefone é obrigatório');
  } else if (!validatePhone(phone)) {
    errors.push('Número português inválido. Use: 9XX XXX XXX ou +351 9XX XXX XXX');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Batch validation helper
 */
export function validateBatch(fields: Record<string, any>, validators: Record<string, (value: any) => ValidationResult>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, validator] of Object.entries(validators)) {
    results[fieldName] = validator(fields[fieldName]);
  }

  return results;
}

/**
 * Check if any validation has errors
 */
export function hasValidationErrors(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).some((result) => !result.valid);
}

/**
 * Get all validation errors
 */
export function getAllValidationErrors(results: Record<string, ValidationResult>): string[] {
  return Object.entries(results)
    .filter(([_, result]) => !result.valid)
    .flatMap(([_, result]) => result.errors);
}
