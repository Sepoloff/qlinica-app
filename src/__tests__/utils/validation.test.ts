import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateDateISO,
  validateTime,
  validateNotEmpty,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe+tag@company.co.uk')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('user..name@example.com')).toBe(false);
      expect(validateEmail('user@.example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true);
      expect(validatePassword('P@ssw0rd!')).toBe(true);
      expect(validatePassword('ValidPassword99')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false); // No uppercase
      expect(validatePassword('PASSWORD')).toBe(false); // No number
      expect(validatePassword('Password')).toBe(false); // No number
      expect(validatePassword('pass123')).toBe(false); // No uppercase
    });

    it('should enforce minimum length of 8', () => {
      expect(validatePassword('Weak12')).toBe(false);
      expect(validatePassword('Weak123')).toBe(false);
      expect(validatePassword('Valid12')).toBe(false);
    });

    it('should require at least one uppercase letter', () => {
      expect(validatePassword('password123')).toBe(false);
    });

    it('should require at least one number', () => {
      expect(validatePassword('PasswordTest')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid Portuguese phone numbers', () => {
      expect(validatePhone('+351 912 345 678')).toBe(true);
      expect(validatePhone('912345678')).toBe(true);
      expect(validatePhone('+351912345678')).toBe(true);
      expect(validatePhone('91 2345678')).toBe(true);
    });

    it('should accept international formats', () => {
      expect(validatePhone('+1 (202) 555-0123')).toBe(true); // US
      expect(validatePhone('+44 20 7123 4567')).toBe(true); // UK
      expect(validatePhone('+33 1 42 34 56 78')).toBe(true); // France
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false); // Too short
      expect(validatePhone('abc')).toBe(false); // Not numbers
      expect(validatePhone('912 abc 678')).toBe(false); // Contains letters
    });

    it('should handle edge cases', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('  ')).toBe(false);
      expect(validatePhone('+351')).toBe(false); // Incomplete
    });
  });

  describe('validateDateISO', () => {
    it('should accept valid ISO dates in future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoDate = tomorrow.toISOString().split('T')[0];

      expect(validateDateISO(isoDate)).toBe(true);
    });

    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isoDate = yesterday.toISOString().split('T')[0];

      expect(validateDateISO(isoDate)).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(validateDateISO('2024/12/25')).toBe(false);
      expect(validateDateISO('25-12-2024')).toBe(false);
      expect(validateDateISO('invalid')).toBe(false);
      expect(validateDateISO('')).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(validateDateISO('2024-02-30')).toBe(false); // Feb 30 doesn't exist
      expect(validateDateISO('2024-13-01')).toBe(false); // Month 13 doesn't exist
    });
  });

  describe('validateTime', () => {
    it('should accept valid time formats', () => {
      expect(validateTime('09:00')).toBe(true);
      expect(validateTime('14:30')).toBe(true);
      expect(validateTime('23:59')).toBe(true);
      expect(validateTime('00:00')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(validateTime('9:00')).toBe(false); // Missing leading zero
      expect(validateTime('09:5')).toBe(false); // Missing trailing zero
      expect(validateTime('25:00')).toBe(false); // Invalid hour
      expect(validateTime('09:60')).toBe(false); // Invalid minute
      expect(validateTime('09-00')).toBe(false); // Wrong separator
    });

    it('should handle edge cases', () => {
      expect(validateTime('')).toBe(false);
      expect(validateTime('  :  ')).toBe(false);
      expect(validateTime('12:30:45')).toBe(false); // Extra seconds
    });
  });

  describe('validateNotEmpty', () => {
    it('should accept non-empty strings', () => {
      expect(validateNotEmpty('hello')).toBe(true);
      expect(validateNotEmpty('  text  ')).toBe(true);
      expect(validateNotEmpty('0')).toBe(true);
    });

    it('should reject empty/whitespace-only strings', () => {
      expect(validateNotEmpty('')).toBe(false);
      expect(validateNotEmpty('   ')).toBe(false);
      expect(validateNotEmpty('\n')).toBe(false);
      expect(validateNotEmpty('\t')).toBe(false);
    });

    it('should handle null/undefined gracefully', () => {
      expect(validateNotEmpty(null as any)).toBe(false);
      expect(validateNotEmpty(undefined as any)).toBe(false);
    });
  });
});
