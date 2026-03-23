/**
 * Token Utilities
 * Pure functions for JWT token handling
 */

import { logger } from './logger';

export interface TokenPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification
 * (only use for getting expiration, not for security-critical data)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    logger.error('Failed to decode token', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferMs = bufferSeconds * 1000;

    return currentTime + bufferMs >= expirationTime;
  } catch (error) {
    logger.error('Failed to check token expiration', error);
    return true;
  }
};

/**
 * Get time until token expiration
 */
export const getTimeUntilExpiration = (token: string): number | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    return timeUntilExpiration > 0 ? timeUntilExpiration : null;
  } catch (error) {
    logger.error('Failed to get token expiration time', error);
    return null;
  }
};

/**
 * Extract exp claim from token (returns seconds since epoch)
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = decodeToken(token);
    return decoded?.exp || null;
  } catch (error) {
    logger.error('Failed to get token expiration', error);
    return null;
  }
};

/**
 * Check if token is valid (not expired)
 */
export const isTokenValid = (token: string, bufferSeconds: number = 60): boolean => {
  return !isTokenExpired(token, bufferSeconds);
};
