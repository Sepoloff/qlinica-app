/**
 * Unit Tests - Validation utilities
 */

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateCardNumber,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name@example.com')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result1 = validatePassword('SecurePass123');
      const result2 = validatePassword('MyPassword1');
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should reject weak passwords', () => {
      const result1 = validatePassword('weak');
      const result2 = validatePassword('nouppercase123');
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid Portuguese phone numbers', () => {
      expect(validatePhone('+351912345678')).toBe(true);
      expect(validatePhone('912345678')).toBe(true);
      expect(validatePhone('961234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('invalid')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateCardNumber', () => {
    it('should validate credit card numbers using Luhn algorithm', () => {
      // Test with valid Luhn numbers
      expect(validateCardNumber('4532015112830366')).toBe(true);
      expect(validateCardNumber('4111111111111111')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(validateCardNumber('1234567890123456')).toBe(false);
      expect(validateCardNumber('invalid')).toBe(false);
      expect(validateCardNumber('')).toBe(false);
    });
  });
});
