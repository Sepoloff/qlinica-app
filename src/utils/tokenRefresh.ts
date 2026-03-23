/**
 * Token Refresh Utility
 * Handles JWT token refresh logic and auto-renewal
 */

import { authStorage } from './storage';
import { api } from '../config/api';
import { logger } from './logger';

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if token expires in less than 5 minutes

/**
 * Decode JWT payload without verification (for client-side checks only)
 * @param token JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    logger.warn('Failed to decode JWT', { error });
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 * @param token JWT token to check
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return false;

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
  } catch (error) {
    logger.warn('Error checking token expiry', { error });
    return false;
  }
}

/**
 * Get remaining time until token expiry
 * @param token JWT token
 * @returns Remaining time in milliseconds, or null if invalid
 */
export function getTokenExpiryTime(token: string): number | null {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;

    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const timeRemaining = expiryTime - now;

    return Math.max(0, timeRemaining);
  } catch (error) {
    return null;
  }
}

/**
 * Attempt to refresh the JWT token
 * @returns true if refresh was successful, false otherwise
 */
export async function refreshJWTToken(): Promise<boolean> {
  try {
    const refreshToken = await authStorage.getRefreshToken();
    
    if (!refreshToken) {
      logger.warn('No refresh token available');
      return false;
    }

    const response = await api.post('/auth/refresh', {
      refreshToken,
    });

    const { token: newToken, refreshToken: newRefreshToken } = response.data;

    if (!newToken) {
      logger.warn('No token in refresh response');
      return false;
    }

    // Update stored tokens
    await authStorage.setToken(newToken);
    if (newRefreshToken) {
      await authStorage.setRefreshToken(newRefreshToken);
    }

    logger.debug('Token refreshed successfully');
    return true;
  } catch (error) {
    logger.warn('Token refresh failed', { error });
    return false;
  }
}

/**
 * Auto-refresh token if needed
 * @returns Promise<boolean> true if no refresh was needed or refresh succeeded
 */
export async function autoRefreshTokenIfNeeded(): Promise<boolean> {
  try {
    const token = await authStorage.getToken();
    
    if (!token) {
      return false;
    }

    if (shouldRefreshToken(token)) {
      logger.debug('Token expiring soon, attempting refresh');
      return await refreshJWTToken();
    }

    return true;
  } catch (error) {
    logger.error('Error in auto-refresh', { error });
    return false;
  }
}

/**
 * Get token info for debugging
 */
export async function getTokenInfo() {
  try {
    const token = await authStorage.getToken();
    if (!token) return null;

    const decoded = decodeJWT(token);
    const expiryTime = getTokenExpiryTime(token);

    return {
      decoded,
      expiresIn: expiryTime ? `${Math.round(expiryTime / 1000)}s` : 'unknown',
      shouldRefresh: shouldRefreshToken(token),
    };
  } catch (error) {
    logger.warn('Error getting token info', { error });
    return null;
  }
}
