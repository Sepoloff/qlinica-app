/**
 * Advanced Validation Utilities
 * Comprehensive validation for forms, emails, passwords, etc.
 */

/**
 * Validate email address (RFC 5322 compliant)
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  // RFC 5322 compliant regex (simplified)
  const emailRegex =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

  if (!email) {
    return { valid: false, error: 'Email é obrigatório' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email muito longo' };
  }

  if (!emailRegex.test(email.toLowerCase())) {
    return { valid: false, error: 'Formato de email inválido' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  }
): { valid: boolean; score: number; error?: string } => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options || {};

  let score = 0;
  const errors: string[] = [];

  if (!password) {
    return { valid: false, score: 0, error: 'Palavra-passe é obrigatória' };
  }

  // Check length
  if (password.length < minLength) {
    errors.push(`Mínimo ${minLength} caracteres`);
  } else {
    score += 2;
  }

  // Check uppercase
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Incluir letra maiúscula');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Check number
  if (requireNumber && !/\d/.test(password)) {
    errors.push('Incluir número');
  } else if (/\d/.test(password)) {
    score += 1;
  }

  // Check special character
  if (requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Incluir caractere especial');
  } else if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 2;
  }

  // Check for common patterns
  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'password123', '12345678', 'letmein',
  ];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    errors.push('Palavra-passe demasiado comum');
    score = Math.max(0, score - 2);
  }

  const valid = errors.length === 0;
  const error = errors.length > 0 ? errors.join('; ') : undefined;

  return { valid, score, error };
};

/**
 * Validate phone number (Portuguese format)
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Telefone é obrigatório' };
  }

  // Remove common formatting
  const cleaned = phone.replace(/[\s\-().+]/g, '');

  // Portuguese phone patterns
  // Mobile: 91-96 (9 digits after 9)
  // Landline: 2-3 (starts with 2-3 followed by area code)
  const patterns = [
    /^(?:00351|351|\+351)?9[1-6]\d{7}$/, // Mobile
    /^(?:00351|351|\+351)?2\d{7,8}$/, // Landline
    /^9[1-6]\d{7}$/, // Mobile short
  ];

  const valid = patterns.some(p => p.test(cleaned));

  if (!valid) {
    return {
      valid: false,
      error: 'Telefone inválido. Use +351 9XXXXXXXX ou 9XXXXXXXX',
    };
  }

  return { valid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Nome é obrigatório' };
  }

  if (name.length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Nome muito longo' };
  }

  // Check for invalid characters
  if (!/^[a-zA-Z\s'-]+$/i.test(name)) {
    return { valid: false, error: 'Nome contém caracteres inválidos' };
  }

  return { valid: true };
};

/**
 * Validate date (not in past)
 */
export const validateFutureDate = (date: Date): { valid: boolean; error?: string } => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (date < now) {
    return { valid: false, error: 'Data não pode ser no passado' };
  }

  return { valid: true };
};

/**
 * Validate time slot format
 */
export const validateTimeSlot = (time: string): { valid: boolean; error?: string } => {
  // Format: HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!time || !timeRegex.test(time)) {
    return { valid: false, error: 'Horário inválido (formato: HH:MM)' };
  }

  return { valid: true };
};

/**
 * Validate booking data
 */
export const validateBookingData = (data: {
  serviceId?: string;
  therapistId?: string;
  date?: Date;
  time?: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.serviceId) {
    errors.service = 'Serviço é obrigatório';
  }

  if (!data.therapistId) {
    errors.therapist = 'Terapeuta é obrigatório';
  }

  if (!data.date) {
    errors.date = 'Data é obrigatória';
  } else {
    const dateValidation = validateFutureDate(data.date);
    if (!dateValidation.valid) {
      errors.date = dateValidation.error || 'Data inválida';
    }
  }

  if (!data.time) {
    errors.time = 'Hora é obrigatória';
  } else {
    const timeValidation = validateTimeSlot(data.time);
    if (!timeValidation.valid) {
      errors.time = timeValidation.error || 'Hora inválida';
    }
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score: number): string => {
  if (score <= 1) return 'Muito fraca';
  if (score <= 2) return 'Fraca';
  if (score <= 3) return 'Média';
  if (score <= 4) return 'Forte';
  return 'Muito forte';
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 1) return '#DC3545'; // Red
  if (score <= 2) return '#FFC107'; // Orange
  if (score <= 3) return '#FFB84D'; // Yellow
  if (score <= 4) return '#28A745'; // Green
  return '#20C997'; // Teal
};
