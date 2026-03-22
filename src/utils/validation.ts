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

/**
 * Validate credit card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Must be 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate card expiry date format (MM/YY)
 */
export const validateCardExpiry = (expiry: string): {
  valid: boolean;
  error?: string;
} => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  
  if (!expiryRegex.test(expiry)) {
    return { valid: false, error: 'Invalid expiry format (MM/YY)' };
  }
  
  const [month, year] = expiry.split('/').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  // Check if card is expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired' };
  }
  
  return { valid: true };
};

/**
 * Validate CVC/CVV (3-4 digits)
 */
export const validateCardCVC = (cvc: string): boolean => {
  return /^\d{3,4}$/.test(cvc);
};

/**
 * Validate cardholder name
 */
export const validateCardholderName = (name: string): boolean => {
  return name.trim().length >= 3 && /^[a-zA-Z\s'-]+$/.test(name);
};

/**
 * Comprehensive card validation
 */
export const validateCreditCard = (
  cardNumber: string,
  expiry: string,
  cvc: string,
  holderName: string
): {
  valid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!cardNumber || !validateCardNumber(cardNumber)) {
    errors.cardNumber = 'Invalid card number';
  }
  
  if (!expiry) {
    errors.expiry = 'Expiry date is required';
  } else {
    const expiryValidation = validateCardExpiry(expiry);
    if (!expiryValidation.valid) {
      errors.expiry = expiryValidation.error || 'Invalid expiry date';
    }
  }
  
  if (!cvc || !validateCardCVC(cvc)) {
    errors.cvc = 'Invalid CVC (must be 3-4 digits)';
  }
  
  if (!holderName || !validateCardholderName(holderName)) {
    errors.holderName = 'Invalid cardholder name';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
