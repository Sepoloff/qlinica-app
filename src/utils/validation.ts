/**
 * Email validation (RFC 5322 compliant)
 * Matches standard email format with proper validation
 */
export const validateEmail = (email: string): boolean => {
  // RFC 5322 simplified but more comprehensive pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Password validation
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Phone validation for Portuguese numbers
 */
export const validatePhone = (phone: string): boolean => {
  // Portuguese phone: +351 9XX XXX XXX or 9XX XXX XXX
  const phoneRegex = /^(?:\+351\s?)?9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Date validation - ensure date is not in the past
 */
export const validateDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Name validation - minimum 2 characters, no numbers
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && !/\d/.test(name);
};

/**
 * Get password strength indicator
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 3) strength = 'medium';
  if (score >= 4) strength = 'strong';

  return { strength, score };
};

/**
 * Validate all auth fields
 */
export const validateAuthFields = (
  email: string,
  password: string,
  name?: string
): {
  valid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  if (name !== undefined) {
    if (!name) {
      errors.name = 'Name is required';
    } else if (!validateName(name)) {
      errors.name = 'Name must be at least 2 characters and contain no numbers';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Comprehensive booking date validation
 */
export const validateBookingDate = (date: Date, timeSlot?: string): {
  valid: boolean;
  error?: string;
} => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Allow bookings up to 90 days in advance
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);

  if (bookingDate < today) {
    return { valid: false, error: 'Cannot book in the past' };
  }

  if (bookingDate > maxDate) {
    return { valid: false, error: 'Cannot book more than 90 days in advance' };
  }

  return { valid: true };
};

/**
 * Validate time slot format (HH:MM)
 */
export const validateTimeSlot = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) return false;

  // Check if time is within business hours (9:00-18:00)
  const [hours, minutes] = time.split(':').map(Number);
  return hours >= 9 && (hours < 18 || (hours === 18 && minutes === 0));
};

/**
 * Validate booking notes (optional, max 500 chars)
 */
export const validateBookingNotes = (notes: string): boolean => {
  return notes.length <= 500;
};
