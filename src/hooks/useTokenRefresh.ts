/**
 * Hook for automatic token refresh
 * Handles JWT token expiration and refresh
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authStorage } from '../utils/storage';
import { api } from '../config/api';
import { logger } from '../utils/logger';
import { isTokenExpired, getTimeUntilExpiration } from '../utils/tokenUtils';

/**
 * Hook to manage token refresh
 */
export const useTokenRefresh = (options: { enableAutoRefresh?: boolean; checkInterval?: number } = {}) => {
  const { enableAutoRefresh = true, checkInterval = 60000 } = options; // Check every minute by default
  const { logout } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Refresh the token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentToken = await authStorage.getToken();
      if (!currentToken) {
        logger.debug('No token to refresh');
        return false;
      }

      logger.debug('Attempting to refresh token');

      try {
        const response = await api.post('/auth/refresh', {
          token: currentToken,
        });

        const { token: newToken } = response.data;
        if (newToken) {
          await authStorage.setToken(newToken);
          logger.debug('Token refreshed successfully');
          return true;
        }

        return false;
      } catch (refreshError: any) {
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          logger.warn('Token refresh failed - logging out');
          await logout();
          return false;
        }
        throw refreshError;
      }
    } catch (error) {
      logger.error('Error refreshing token', error);
      return false;
    }
  }, [logout]);

  /**
   * Check and refresh token if needed
   */
  const checkAndRefreshToken = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      if (!token) return;

      if (isTokenExpired(token, 120)) {
        // Refresh if within 2 minutes of expiration
        logger.debug('Token is expiring soon, attempting refresh');
        await refreshToken();
      }
    } catch (error) {
      logger.error('Error checking token', error);
    }
  }, [refreshToken]);

  /**
   * Setup auto-refresh interval
   */
  useEffect(() => {
    if (!enableAutoRefresh) return;

    // Initial check
    checkAndRefreshToken();

    // Set up interval
    refreshTimeoutRef.current = setInterval(checkAndRefreshToken, checkInterval);

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [enableAutoRefresh, checkInterval, checkAndRefreshToken]);

  return {
    refreshToken,
    checkAndRefreshToken,
    isTokenExpired: (token?: string) => {
      if (!token) return false;
      return isTokenExpired(token);
    },
    getTimeUntilExpiration: (token?: string) => {
      if (!token) return null;
      return getTimeUntilExpiration(token);
    },
  };
};

// Re-export utilities for convenience
export { decodeToken, isTokenExpired, getTimeUntilExpiration } from '../utils/tokenUtils';
