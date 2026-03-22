/**
 * Unit Tests - Validation utilities
 */

import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateCreditCard,
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
      expect(validatePassword('SecurePass123')).toBe(true);
      expect(validatePassword('MyPassword1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('noupppercase123')).toBe(false);
      expect(validatePassword('NOLOWERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept valid Portuguese phone numbers', () => {
      expect(validatePhoneNumber('+351912345678')).toBe(true);
      expect(validatePhoneNumber('912345678')).toBe(true);
      expect(validatePhoneNumber('961234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateCreditCard', () => {
    it('should validate credit card numbers using Luhn algorithm', () => {
      // Test with valid Luhn numbers
      expect(validateCreditCard('4532015112830366')).toBe(true);
      expect(validateCreditCard('5425233010103442')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(validateCreditCard('1234567890123456')).toBe(false);
      expect(validateCreditCard('invalid')).toBe(false);
      expect(validateCreditCard('')).toBe(false);
    });
  });
});
