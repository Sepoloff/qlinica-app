/**
 * Unit Tests - Form Validator
 */

import {
  validateLoginForm,
  validateRegistrationForm,
  validateBookingForm,
} from '../utils/formValidator';

describe('Form Validator', () => {
  describe('validateLoginForm', () => {
    it('should validate correct login form', () => {
      const result = validateLoginForm({
        email: 'user@example.com',
        password: 'SecurePass123',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid email', () => {
      const result = validateLoginForm({
        email: 'invalid-email',
        password: 'SecurePass123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject short password', () => {
      const result = validateLoginForm({
        email: 'user@example.com',
        password: 'weak',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateRegistrationForm', () => {
    it('should validate correct registration form', () => {
      const result = validateRegistrationForm({
        email: 'newuser@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe',
        phone: '912345678',
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = validateRegistrationForm({
        email: 'newuser@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
        name: 'John Doe',
        phone: '912345678',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });

  describe('validateBookingForm', () => {
    it('should validate correct booking form', () => {
      const result = validateBookingForm({
        serviceId: 'service123',
        therapistId: 'therapist123',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '14:00',
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject past dates', () => {
      const result = validateBookingForm({
        serviceId: 'service123',
        therapistId: 'therapist123',
        date: new Date(Date.now() - 86400000).toISOString(),
        time: '14:00',
      });
      expect(result.isValid).toBe(false);
    });
  });
});
