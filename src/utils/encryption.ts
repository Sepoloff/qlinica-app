/**
 * Encryption Utilities
 * Basic encryption for sensitive data stored locally
 * Note: This uses base64 encoding + simple XOR for local storage
 * For production, use react-native-crypto or similar robust solution
 */

import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';

const ENCRYPTION_KEY = 'qlinica_app_secure_key_2024';

class EncryptionService {
  /**
   * Simple XOR cipher - for local storage only
   * NOT suitable for high-security data
   */
  private xorCipher(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  /**
   * Encrypt data using base64 + XOR
   */
  encrypt(data: string): string {
    try {
      const xored = this.xorCipher(data, ENCRYPTION_KEY);
      const encoded = Buffer.from(xored, 'binary').toString('base64');
      return encoded;
    } catch (error) {
      logger.error('Encryption failed', error);
      return data; // Fallback to plaintext
    }
  }

  /**
   * Decrypt data using base64 + XOR
   */
  decrypt(encryptedData: string): string {
    try {
      const decoded = Buffer.from(encryptedData, 'base64').toString('binary');
      const xored = this.xorCipher(decoded, ENCRYPTION_KEY);
      return xored;
    } catch (error) {
      logger.error('Decryption failed', error);
      return encryptedData; // Fallback
    }
  }

  /**
   * Securely store sensitive data using platform secure storage
   */
  async secureStore(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      logger.debug(`Secure value stored for key: ${key}`);
    } catch (error) {
      logger.error(`Failed to securely store value for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Retrieve from secure storage
   */
  async secureRetrieve(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      logger.error(`Failed to retrieve secure value for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove from secure storage
   */
  async secureRemove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      logger.debug(`Secure value removed for key: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove secure value for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Hash password using simple method (NOT production-ready)
   * For production, use bcrypt or similar
   */
  hashPassword(password: string): string {
    try {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    } catch (error) {
      logger.error('Password hashing failed', error);
      return '';
    }
  }

  /**
   * Generate random token
   */
  generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: string, visibleChars: number = 3): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return visible + masked;
  }
}

export const encryptionService = new EncryptionService();
