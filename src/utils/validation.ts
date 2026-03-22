/**
 * Email validation (RFC 5322 simplified)
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
