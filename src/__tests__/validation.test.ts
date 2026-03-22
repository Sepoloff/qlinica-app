/**
 * Validation Tests
 * Unit tests for validation utilities
 */

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateDate,
  validateName,
  getPasswordStrength,
} from '../utils/validation';

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('john.doe@company.co.uk')).toBe(true);
    expect(validateEmail('test+tag@gmail.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid.email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('should reject emails exceeding max length', () => {
    const longEmail = 'a'.repeat(255) + '@example.com';
    expect(validateEmail(longEmail)).toBe(false);
  });
});

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('StrongPass123');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('should reject password without number', () => {
    const result = validatePassword('StrongPass');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });
});

describe('Phone Validation', () => {
  it('should validate Portuguese phone numbers', () => {
    expect(validatePhone('912345678')).toBe(true);
    expect(validatePhone('+351 912345678')).toBe(true);
    expect(validatePhone('+351912345678')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123456789')).toBe(false);
    expect(validatePhone('81234567')).toBe(false);
    expect(validatePhone('invalid')).toBe(false);
  });
});

describe('Date Validation', () => {
  it('should accept future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateDate(tomorrow)).toBe(true);
  });

  it('should accept today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(validateDate(today)).toBe(true);
  });

  it('should reject past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(validateDate(yesterday)).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should validate proper names', () => {
    expect(validateName('John Doe')).toBe(true);
    expect(validateName('Maria Silva')).toBe(true);
    expect(validateName('Jo')).toBe(true);
  });

  it('should reject names with numbers', () => {
    expect(validateName('John123')).toBe(false);
    expect(validateName('Maria2')).toBe(false);
  });

  it('should reject names shorter than 2 characters', () => {
    expect(validateName('J')).toBe(false);
    expect(validateName('')).toBe(false);
  });
});

describe('Password Strength', () => {
  it('should rate weak passwords', () => {
    const result = getPasswordStrength('weak');
    expect(result.strength).toBe('weak');
  });

  it('should rate medium passwords', () => {
    const result = getPasswordStrength('Medium123');
    expect(result.strength).toBe('medium');
  });

  it('should rate strong passwords', () => {
    const result = getPasswordStrength('StrongP@ssw0rd');
    expect(result.strength).toBe('strong');
  });
});
