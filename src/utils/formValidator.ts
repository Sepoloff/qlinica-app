'use strict';

/**
 * Comprehensive form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Email validation (RFC 5322 simplified)
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (optional but recommended)
 */
export const validatePassword = (password: string): { isStrong: boolean; message: string } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número');
  }

  return {
    isStrong: errors.length === 0,
    message: errors.length > 0 ? `Palavra-passe fraca: ${errors.join(', ')}` : 'Palavra-passe forte',
  };
};

/**
 * Phone validation (Portuguese format)
 * Accepts: +351 XXX XXXXXX or 9XXXXXXXX or +351XXXXXXXXX
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+351\s?|9)[0-9\s]{8,}$|^[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Date validation (not in the past)
 */
export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Time validation (valid format HH:MM)
 */
export const validateTime = (timeString: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Name validation (at least 2 characters, letters and spaces)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
  return nameRegex.test(name.trim());
};

/**
 * Login form validation
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'E-mail é obrigatório';
  } else if (!validateEmail(email)) {
    errors.email = 'E-mail inválido';
  }

  if (!password) {
    errors.password = 'Palavra-passe é obrigatória';
  } else if (password.length < 6) {
    errors.password = 'Palavra-passe inválida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Register form validation
 */
export const validateRegisterForm = (email: string, password: string, name: string, phone?: string): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!email) {
    errors.email = 'E-mail é obrigatório';
  } else if (!validateEmail(email)) {
    errors.email = 'E-mail inválido';
  }

  // Password validation
  if (!password) {
    errors.password = 'Palavra-passe é obrigatória';
  } else {
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isStrong) {
      errors.password = passwordCheck.message;
    }
  }

  // Name validation
  if (!name) {
    errors.name = 'Nome é obrigatório';
  } else if (!validateName(name)) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  // Phone validation (optional but if provided, must be valid)
  if (phone && !validatePhone(phone)) {
    errors.phone = 'Número de telefone inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Booking form validation
 */
export const validateBookingForm = (serviceId?: number, therapistId?: number, date?: string, time?: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!serviceId) {
    errors.service = 'Selecione um serviço';
  }

  if (!therapistId) {
    errors.therapist = 'Selecione um terapeuta';
  }

  if (!date) {
    errors.date = 'Selecione uma data';
  } else if (!validateDate(date)) {
    errors.date = 'A data não pode ser no passado';
  }

  if (!time) {
    errors.time = 'Selecione uma hora';
  } else if (!validateTime(time)) {
    errors.time = 'Hora inválida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Profile update form validation
 */
export const validateProfileForm = (name?: string, phone?: string, email?: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (name && !validateName(name)) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  if (phone && !validatePhone(phone)) {
    errors.phone = 'Número de telefone inválido';
  }

  if (email && !validateEmail(email)) {
    errors.email = 'E-mail inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
