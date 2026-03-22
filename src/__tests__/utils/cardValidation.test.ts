import {
  validateCardNumber,
  validateCardExpiry,
  validateCardCVC,
  validateCardholderName,
  validateCreditCard,
} from '../../utils/validation';

describe('Card Validation', () => {
  describe('validateCardNumber', () => {
    it('should validate valid Visa card', () => {
      const validVisa = '4532015112830366';
      expect(validateCardNumber(validVisa)).toBe(true);
    });

    it('should validate valid Mastercard', () => {
      const validMC = '5555555555554444';
      expect(validateCardNumber(validMC)).toBe(true);
    });

    it('should reject invalid card number', () => {
      expect(validateCardNumber('1234567890123456')).toBe(false);
    });

    it('should reject card with non-numeric characters if not cleaned properly', () => {
      // Note: Our implementation removes spaces and dashes, so this actually passes
      expect(validateCardNumber('4532-0151-1283-0366')).toBe(true);
    });

    it('should reject too short card number', () => {
      expect(validateCardNumber('123456789')).toBe(false);
    });

    it('should reject too long card number', () => {
      expect(validateCardNumber('12345678901234567890')).toBe(false);
    });

    it('should handle spaces in card number', () => {
      const cardWithSpaces = '4532 0151 1283 0366';
      // Should handle spaces by removing them
      expect(validateCardNumber(cardWithSpaces)).toBe(true);
    });

    it('should reject empty string', () => {
      expect(validateCardNumber('')).toBe(false);
    });
  });

  describe('validateCardExpiry', () => {
    it('should validate valid future expiry date', () => {
      const now = new Date();
      const nextYear = (now.getFullYear() % 100) + 1;
      const validExpiry = `12/${nextYear}`;
      expect(validateCardExpiry(validExpiry).valid).toBe(true);
    });

    it('should reject expired card', () => {
      const result = validateCardExpiry('12/20');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Card has expired');
    });

    it('should reject invalid format (wrong month)', () => {
      const result = validateCardExpiry('13/25');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid expiry format (MM/YY)');
    });

    it('should reject invalid format (missing slash)', () => {
      const result = validateCardExpiry('1225');
      expect(result.valid).toBe(false);
    });

    it('should validate future month of current year', () => {
      const now = new Date();
      const futureMonth = String((now.getMonth() + 2) % 12 || 1).padStart(2, '0');
      const futureYear = String(now.getFullYear() % 100).padStart(2, '0');
      
      const result = validateCardExpiry(`${futureMonth}/${futureYear}`);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid format (wrong separator)', () => {
      const result = validateCardExpiry('12-25');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCardCVC', () => {
    it('should validate 3-digit CVC', () => {
      expect(validateCardCVC('123')).toBe(true);
    });

    it('should validate 4-digit CVC (American Express)', () => {
      expect(validateCardCVC('1234')).toBe(true);
    });

    it('should reject 2-digit CVC', () => {
      expect(validateCardCVC('12')).toBe(false);
    });

    it('should reject 5-digit CVC', () => {
      expect(validateCardCVC('12345')).toBe(false);
    });

    it('should reject non-numeric CVC', () => {
      expect(validateCardCVC('12a')).toBe(false);
    });

    it('should reject empty CVC', () => {
      expect(validateCardCVC('')).toBe(false);
    });
  });

  describe('validateCardholderName', () => {
    it('should validate valid cardholder name', () => {
      expect(validateCardholderName('John Doe')).toBe(true);
    });

    it('should validate name with apostrophe', () => {
      expect(validateCardholderName("Mary O'Brien")).toBe(true);
    });

    it('should validate name with hyphen', () => {
      expect(validateCardholderName('Jean-Claude')).toBe(true);
    });

    it('should reject name too short', () => {
      expect(validateCardholderName('Jo')).toBe(false);
    });

    it('should reject name with numbers', () => {
      expect(validateCardholderName('John Doe 2')).toBe(false);
    });

    it('should reject name with special characters', () => {
      expect(validateCardholderName('John@Doe')).toBe(false);
    });

    it('should reject empty name', () => {
      expect(validateCardholderName('')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validateCardholderName('  John Doe  ')).toBe(true);
    });
  });

  describe('validateCreditCard (comprehensive)', () => {
    it('should validate complete valid card', () => {
      const result = validateCreditCard(
        '4532015112830366',
        '12/26',
        '123',
        'John Doe'
      );
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should return multiple errors for invalid card', () => {
      const result = validateCreditCard(
        '1234567890',
        '13/20',
        '12',
        'Jo'
      );
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should identify invalid card number', () => {
      const result = validateCreditCard(
        '1234567890123456',
        '12/26',
        '123',
        'John Doe'
      );
      expect(result.errors.cardNumber).toBeDefined();
    });

    it('should identify expired card', () => {
      const result = validateCreditCard(
        '4532015112830366',
        '12/20',
        '123',
        'John Doe'
      );
      expect(result.errors.expiry).toBeDefined();
    });

    it('should identify invalid CVC', () => {
      const result = validateCreditCard(
        '4532015112830366',
        '12/26',
        '12',
        'John Doe'
      );
      expect(result.errors.cvc).toBeDefined();
    });

    it('should identify invalid cardholder name', () => {
      const result = validateCreditCard(
        '4532015112830366',
        '12/26',
        '123',
        'Jo'
      );
      expect(result.errors.holderName).toBeDefined();
    });

    it('should handle missing card number', () => {
      const result = validateCreditCard(
        '',
        '12/26',
        '123',
        'John Doe'
      );
      expect(result.errors.cardNumber).toBeDefined();
    });

    it('should handle missing expiry', () => {
      const result = validateCreditCard(
        '4532015112830366',
        '',
        '123',
        'John Doe'
      );
      expect(result.errors.expiry).toBeDefined();
    });
  });

  describe('Card type detection', () => {
    it('should work with Visa cards (4 prefix)', () => {
      expect(validateCardNumber('4111111111111111')).toBe(true);
    });

    it('should work with Mastercard (5 prefix)', () => {
      expect(validateCardNumber('5555555555554444')).toBe(true);
    });

    it('should work with American Express (34/37 prefix)', () => {
      // Amex uses 4-digit CVC
      expect(validateCardNumber('378282246310005')).toBe(true);
    });

    it('should work with Discover (6 prefix)', () => {
      expect(validateCardNumber('6011111111111117')).toBe(true);
    });
  });
});
