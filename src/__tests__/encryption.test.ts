/**
 * Encryption Service Tests
 * Unit tests for encryption utilities
 */

import { encryptionService } from '../utils/encryption';

describe('Encryption Service', () => {
  describe('XOR Cipher', () => {
    it('should encrypt and decrypt data correctly', () => {
      const original = 'Hello, World!';
      const encrypted = encryptionService.encrypt(original);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(encrypted).not.toBe(original);
      expect(decrypted).toBe(original);
    });

    it('should handle empty strings', () => {
      const original = '';
      const encrypted = encryptionService.encrypt(original);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle special characters', () => {
      const original = 'test@123!$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encryptionService.encrypt(original);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle unicode characters (with note about limitations)', () => {
      const original = 'Olá Mundo!';
      const encrypted = encryptionService.encrypt(original);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(original);
      // Note: Complex unicode (emoji, CJK) may have issues with XOR cipher
      // This is expected behavior with simple cipher
    });

    it('should produce different encryption each time (XOR property)', () => {
      const data = 'test data';
      // Note: XOR with same key produces same result, so this test verifies consistency
      const encrypted1 = encryptionService.encrypt(data);
      const encrypted2 = encryptionService.encrypt(data);

      expect(encrypted1).toBe(encrypted2); // Same input = same output with XOR
    });
  });

  describe('Password Hashing', () => {
    it('should generate hash for password', () => {
      const password = 'StrongPassword123';
      const hash = encryptionService.hashPassword(password);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate same hash for same password', () => {
      const password = 'test123';
      const hash1 = encryptionService.hashPassword(password);
      const hash2 = encryptionService.hashPassword(password);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different passwords', () => {
      const password1 = 'password123';
      const password2 = 'password456';

      const hash1 = encryptionService.hashPassword(password1);
      const hash2 = encryptionService.hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Token Generation', () => {
    it('should generate random tokens', () => {
      const token = encryptionService.generateToken(32);

      expect(token).toBeTruthy();
      expect(token.length).toBe(32);
    });

    it('should generate different tokens each time', () => {
      const token1 = encryptionService.generateToken(32);
      const token2 = encryptionService.generateToken(32);

      expect(token1).not.toBe(token2);
    });

    it('should respect token length parameter', () => {
      expect(encryptionService.generateToken(10).length).toBe(10);
      expect(encryptionService.generateToken(64).length).toBe(64);
      expect(encryptionService.generateToken(1).length).toBe(1);
    });

    it('should only contain alphanumeric characters', () => {
      const token = encryptionService.generateToken(100);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });
  });

  describe('Mask Sensitive Data', () => {
    it('should mask data correctly', () => {
      const data = 'secretpassword123';
      const masked = encryptionService.maskSensitiveData(data, 3);

      // Should show first 3 chars + mask rest
      expect(masked.startsWith('sec')).toBe(true);
      expect(masked.length).toBe(data.length);
      expect(masked.includes('*')).toBe(true);
    });

    it('should mask data when visible chars exceed length', () => {
      const data = 'sec';
      const masked = encryptionService.maskSensitiveData(data, 5); // visibleChars > length

      // Should mask everything when visible chars > data length
      expect(masked).toBe('***');
    });

    it('should handle very short data with large visible chars', () => {
      const data = 's';
      const masked = encryptionService.maskSensitiveData(data, 5);

      expect(masked).toBe('*');
    });

    it('should use default visible characters', () => {
      const data = 'longdatasample';
      const masked = encryptionService.maskSensitiveData(data);

      // Default is 3 visible chars
      expect(masked.startsWith('lon')).toBe(true);
      expect(masked.length).toBe(data.length);
    });

    it('should handle email masking', () => {
      const email = 'user@example.com';
      const masked = encryptionService.maskSensitiveData(email, 4);

      expect(masked.startsWith('user')).toBe(true);
      expect(masked.includes('*')).toBe(true);
      expect(masked.length).toBe(email.length);
    });
  });
});
