import {
  validateEmailField,
  validatePasswordField,
  validatePasswordConfirmation,
  validateNameField,
  validatePhoneField,
  validateDateField,
  validateTimeField,
  validateRequiredField,
  validateFieldLength,
  validateNumberField,
  validateSelectField,
  validateCheckboxField,
  createValidator,
} from '../../utils/formValidationHelpers';
import { MESSAGES } from '../../constants/Messages';

describe('Form Validation Helpers', () => {
  describe('validateEmailField', () => {
    it('should validate correct email', () => {
      const result = validateEmailField('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject empty email', () => {
      const result = validateEmailField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.EMAIL_REQUIRED);
    });

    it('should reject invalid email', () => {
      const result = validateEmailField('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.EMAIL_INVALID);
    });
  });

  describe('validatePasswordField', () => {
    it('should validate strong password', () => {
      const result = validatePasswordField('SecurePass123');
      expect(result.valid).toBe(true);
    });

    it('should reject empty password', () => {
      const result = validatePasswordField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.PASSWORD_REQUIRED);
    });

    it('should reject weak password', () => {
      const result = validatePasswordField('weak');
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      const result = validatePasswordConfirmation('Password123', 'Password123');
      expect(result.valid).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = validatePasswordConfirmation('Password123', 'Different123');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.PASSWORD_MISMATCH);
    });

    it('should reject empty confirmation', () => {
      const result = validatePasswordConfirmation('Password123', '');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNameField', () => {
    it('should validate correct name', () => {
      const result = validateNameField('João Silva');
      expect(result.valid).toBe(true);
    });

    it('should reject empty name', () => {
      const result = validateNameField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.NAME_REQUIRED);
    });

    it('should reject too short name', () => {
      const result = validateNameField('J');
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePhoneField', () => {
    it('should validate portuguese phone', () => {
      const result = validatePhoneField('912345678');
      expect(result.valid).toBe(true);
    });

    it('should validate phone with country code', () => {
      const result = validatePhoneField('+351912345678');
      expect(result.valid).toBe(true);
    });

    it('should reject empty phone', () => {
      const result = validatePhoneField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.PHONE_REQUIRED);
    });

    it('should reject invalid phone', () => {
      const result = validatePhoneField('12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.PHONE_INVALID);
    });
  });

  describe('validateDateField', () => {
    it('should validate future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = validateDateField(futureDate.toISOString().split('T')[0]);
      expect(result.valid).toBe(true);
    });

    it('should reject past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = validateDateField(pastDate.toISOString().split('T')[0]);
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.DATE_PAST);
    });

    it('should reject empty date', () => {
      const result = validateDateField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.DATE_REQUIRED);
    });
  });

  describe('validateTimeField', () => {
    it('should validate correct time', () => {
      const result = validateTimeField('14:30');
      expect(result.valid).toBe(true);
    });

    it('should reject empty time', () => {
      const result = validateTimeField('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe(MESSAGES.VALIDATION.TIME_REQUIRED);
    });

    it('should reject invalid time format', () => {
      const result = validateTimeField('25:00');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateRequiredField', () => {
    it('should validate non-empty field', () => {
      const result = validateRequiredField('Some value');
      expect(result.valid).toBe(true);
    });

    it('should reject empty field', () => {
      const result = validateRequiredField('');
      expect(result.valid).toBe(false);
    });

    it('should use custom field name in error', () => {
      const result = validateRequiredField('', 'Username');
      expect(result.message).toContain('Username');
    });
  });

  describe('validateFieldLength', () => {
    it('should validate within length range', () => {
      const result = validateFieldLength('hello', 3, 10);
      expect(result.valid).toBe(true);
    });

    it('should reject too short', () => {
      const result = validateFieldLength('hi', 3, 10);
      expect(result.valid).toBe(false);
    });

    it('should reject too long', () => {
      const result = validateFieldLength('hello world!', 3, 10);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNumberField', () => {
    it('should validate valid number', () => {
      const result = validateNumberField('42');
      expect(result.valid).toBe(true);
    });

    it('should validate within range', () => {
      const result = validateNumberField('5', 0, 10);
      expect(result.valid).toBe(true);
    });

    it('should reject below minimum', () => {
      const result = validateNumberField('5', 10, 100);
      expect(result.valid).toBe(false);
    });

    it('should reject above maximum', () => {
      const result = validateNumberField('150', 10, 100);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid number', () => {
      const result = validateNumberField('abc');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSelectField', () => {
    it('should validate selected value', () => {
      const result = validateSelectField('option1');
      expect(result.valid).toBe(true);
    });

    it('should reject null value', () => {
      const result = validateSelectField(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined value', () => {
      const result = validateSelectField(undefined);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCheckboxField', () => {
    it('should validate checked checkbox', () => {
      const result = validateCheckboxField(true);
      expect(result.valid).toBe(true);
    });

    it('should reject unchecked checkbox', () => {
      const result = validateCheckboxField(false);
      expect(result.valid).toBe(false);
    });
  });

  describe('createValidator', () => {
    it('should create custom validator', () => {
      const isEven = (val: string) => parseInt(val) % 2 === 0;
      const validator = createValidator(isEven, 'Must be even number');

      expect(validator('4').valid).toBe(true);
      expect(validator('3').valid).toBe(false);
      expect(validator('3').message).toBe('Must be even number');
    });
  });
});
