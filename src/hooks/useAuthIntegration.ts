/**
 * useAuthIntegration Hook
 * Manages authentication state with JWT auto-refresh and error handling
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { autoRefreshTokenIfNeeded, getTokenExpiryTime } from '../utils/tokenRefresh';
import { authStorage } from '../utils/storage';
import { logger } from '../utils/logger';

interface UseAuthIntegrationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  onTokenExpired?: () => void;
  onRefreshFailed?: () => void;
}

/**
 * Enhanced auth hook with JWT refresh integration
 * 
 * Features:
 * - Automatic token refresh before expiry
 * - Configurable refresh interval
 * - Callbacks for token events
 * - Graceful error handling
 * 
 * @example
 * const { user, isAuthenticated } = useAuthIntegration({
 *   autoRefresh: true,
 *   refreshInterval: 60000, // every minute
 *   onTokenExpired: () => showToast('Session expired'),
 * });
 */
export function useAuthIntegration(options: UseAuthIntegrationOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    onTokenExpired,
    onRefreshFailed,
  } = options;

  const auth = useAuth();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Perform token refresh
   */
  const performTokenRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      logger.debug('Token refresh already in progress');
      return;
    }

    try {
      isRefreshingRef.current = true;
      const success = await autoRefreshTokenIfNeeded();

      if (!success) {
        logger.warn('Token refresh failed, user should re-authenticate');
        onRefreshFailed?.();
      }
    } catch (error) {
      logger.error('Error during token refresh', { error });
      onRefreshFailed?.();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefreshFailed]);

  /**
   * Setup auto-refresh timer
   */
  useEffect(() => {
    if (!autoRefresh || !auth.isAuthenticated) {
      return;
    }

    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Setup new refresh interval
    refreshTimerRef.current = setInterval(() => {
      performTokenRefresh();
    }, refreshInterval);

    logger.debug(`Auth auto-refresh enabled (interval: ${refreshInterval}ms)`);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, auth.isAuthenticated, performTokenRefresh, refreshInterval]);

  /**
   * Check token on mount
   */
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    (async () => {
      try {
        const token = await authStorage.getToken();
        if (!token) return;

        const expiryTime = getTokenExpiryTime(token);
        if (expiryTime !== null && expiryTime < 0) {
          logger.warn('Token already expired');
          onTokenExpired?.();
        }
      } catch (error) {
        logger.warn('Error checking token on mount', { error });
      }
    })();
  }, [auth.isAuthenticated, onTokenExpired]);

  return {
    ...auth,
    manualRefresh: performTokenRefresh,
  };
}
