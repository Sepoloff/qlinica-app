/**
 * Testes para validação de campos
 * Testa: email, password, phone
 */

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateAuthFields,
} from '../../utils/validation';

describe('Validation Utils - Core Functions', () => {
  // ============== EMAIL TESTS ==============
  describe('validateEmail', () => {
    it('✅ deve aceitar emails válidos', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.uk')).toBe(true);
      expect(validateEmail('test+tag@domain.com')).toBe(true);
    });

    it('❌ deve rejeitar emails inválidos', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('❌ deve rejeitar emails muito longos', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  // ============== PASSWORD TESTS ==============
  describe('validatePassword', () => {
    it('✅ deve aceitar senhas fortes', () => {
      const result = validatePassword('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('❌ deve rejeitar senha muito curta', () => {
      const result = validatePassword('Short1A');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('❌ deve rejeitar senha sem uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('❌ deve rejeitar senha sem número', () => {
      const result = validatePassword('NoNumberPass');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('✅ deve retornar array de erros correto', () => {
      const result = validatePassword('nouppercase123');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ============== PHONE TESTS ==============
  describe('validatePhone', () => {
    it('✅ deve aceitar números Portuguese válidos', () => {
      expect(validatePhone('+351 912 345 678')).toBe(true);
      expect(validatePhone('912345678')).toBe(true);
      expect(validatePhone('+351912345678')).toBe(true);
      expect(validatePhone('91 2345 678')).toBe(true);
    });

    it('❌ deve rejeitar números inválidos', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('912 abc 678')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });

    it('❌ deve rejeitar números muito curtos', () => {
      expect(validatePhone('911')).toBe(false);
      expect(validatePhone('+351 91')).toBe(false);
    });

    it('✅ deve aceitar vários formatos Portuguese', () => {
      expect(validatePhone('+351 91 1234567')).toBe(true);
      expect(validatePhone('919876543')).toBe(true);
    });
  });

  // ============== NAME TESTS ==============
  describe('validateName', () => {
    it('✅ deve aceitar nomes válidos', () => {
      expect(validateName('João')).toBe(true);
      expect(validateName('Maria Silva')).toBe(true);
      expect(validateName('An')).toBe(true); // 2 chars minimum
    });

    it('❌ deve rejeitar nomes muito curtos', () => {
      expect(validateName('A')).toBe(false);
      expect(validateName('')).toBe(false);
    });

    it('❌ deve rejeitar nomes com números', () => {
      expect(validateName('João123')).toBe(false);
      expect(validateName('User1')).toBe(false);
    });

    it('❌ deve rejeitar whitespace apenas', () => {
      expect(validateName('   ')).toBe(false);
      expect(validateName('\n')).toBe(false);
    });
  });

  // ============== AUTH FIELDS VALIDATION ==============
  describe('validateAuthFields', () => {
    it('✅ deve validar campos corretos para login', () => {
      const result = validateAuthFields(
        'user@example.com',
        'ValidPass123'
      );
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('✅ deve validar campos corretos para register', () => {
      const result = validateAuthFields(
        'newuser@example.com',
        'StrongPass123',
        'João Silva'
      );
      expect(result.valid).toBe(true);
      expect(result.errors.email).toBeUndefined();
      expect(result.errors.password).toBeUndefined();
      expect(result.errors.name).toBeUndefined();
    });

    it('❌ deve rejeitar email inválido', () => {
      const result = validateAuthFields(
        'invalid-email',
        'ValidPass123'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('❌ deve rejeitar password fraca', () => {
      const result = validateAuthFields(
        'user@example.com',
        'weak'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('❌ deve rejeitar nome inválido no register', () => {
      const result = validateAuthFields(
        'user@example.com',
        'ValidPass123',
        'A123'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('❌ deve detectar múltiplos erros', () => {
      const result = validateAuthFields(
        'bad-email',
        'weak',
        '1'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.name).toBeDefined();
    });

    it('❌ deve rejeitar email vazio', () => {
      const result = validateAuthFields('', 'ValidPass123');
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
    });
  });
});
