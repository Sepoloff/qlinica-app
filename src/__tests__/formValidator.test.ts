/**
 * Unit Tests - Form Validator
 */

import {
  validateLoginForm,
  validateRegisterForm,
  validateBookingForm,
} from '../utils/formValidator';

describe('Form Validator', () => {
  describe('validateLoginForm', () => {
    it('should validate correct login form', () => {
      const result = validateLoginForm('user@example.com', 'SecurePass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid email', () => {
      const result = validateLoginForm('invalid-email', 'SecurePass123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject short password', () => {
      const result = validateLoginForm('user@example.com', 'weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateRegisterForm', () => {
    it('should validate correct registration form', () => {
      const result = validateRegisterForm('newuser@example.com', 'SecurePass123', 'John Doe', '912345678');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateRegisterForm('invalid-email', 'SecurePass123', 'John Doe', '912345678');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject weak password', () => {
      const result = validateRegisterForm('newuser@example.com', 'weak', 'John Doe', '912345678');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateBookingForm', () => {
    it('should validate correct booking form', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const result = validateBookingForm(1, 1, futureDate, '14:00');
      expect(result.isValid).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const result = validateBookingForm(1, 1, pastDate, '14:00');
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid time format', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const result = validateBookingForm(1, 1, futureDate, 'invalid');
      expect(result.isValid).toBe(false);
    });
  });
});
