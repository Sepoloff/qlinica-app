/**
 * useAuthRefresh Hook
 * Handles automatic token refresh with exponential backoff
 * Prevents token refresh storms and manages refresh state
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface RefreshConfig {
  interval?: number; // Check interval in ms (default: 55 seconds)
  bufferTime?: number; // Refresh before expiry (default: 60 seconds)
  maxRetries?: number; // Max retry attempts (default: 3)
  backoffMultiplier?: number; // Exponential backoff (default: 1.5)
}

const DEFAULT_CONFIG: Required<RefreshConfig> = {
  interval: 55000, // Check every 55 seconds
  bufferTime: 60000, // Refresh 60 seconds before expiry
  maxRetries: 3,
  backoffMultiplier: 1.5,
};

interface RefreshState {
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshCount: number;
  nextRetryTime: number | null;
}

export const useAuthRefresh = (config: RefreshConfig = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { isAuthenticated, refreshToken } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [refreshState, setRefreshState] = useState<RefreshState>({
    isRefreshing: false,
    lastRefreshTime: null,
    refreshCount: 0,
    nextRetryTime: null,
  });

  // Calculate exponential backoff delay
  const getBackoffDelay = useCallback(
    (retryCount: number): number => {
      const baseDelay = 1000; // 1 second
      const delay = baseDelay * Math.pow(mergedConfig.backoffMultiplier, retryCount);
      const jitter = Math.random() * 1000; // Add up to 1 second jitter
      return Math.min(delay + jitter, 30000); // Cap at 30 seconds
    },
    [mergedConfig.backoffMultiplier],
  );

  // Attempt token refresh with retry logic
  const attemptRefresh = useCallback(
    async (retryCount = 0): Promise<boolean> => {
      try {
        setRefreshState((prev) => ({ ...prev, isRefreshing: true }));

        const success = await refreshToken();

        if (success) {
          setRefreshState((prev) => ({
            ...prev,
            isRefreshing: false,
            lastRefreshTime: Date.now(),
            refreshCount: prev.refreshCount + 1,
            nextRetryTime: null,
          }));
          return true;
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.warn(`[AuthRefresh] Refresh attempt ${retryCount + 1} failed:`, error);

        if (retryCount < mergedConfig.maxRetries) {
          const delay = getBackoffDelay(retryCount);
          const nextRetryTime = Date.now() + delay;

          setRefreshState((prev) => ({
            ...prev,
            nextRetryTime,
          }));

          retryTimeoutRef.current = setTimeout(() => {
            attemptRefresh(retryCount + 1);
          }, delay);

          return false;
        } else {
          // Max retries reached, give up
          setRefreshState((prev) => ({
            ...prev,
            isRefreshing: false,
            nextRetryTime: null,
          }));
          console.error('[AuthRefresh] Max refresh retries exceeded');
          return false;
        }
      }
    },
    [refreshToken, mergedConfig.maxRetries, getBackoffDelay],
  );

  // Setup automatic refresh interval
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initial refresh check
    const checkToken = async () => {
      await attemptRefresh();
    };

    checkToken();

    // Setup interval for periodic checks
    intervalRef.current = setInterval(checkToken, mergedConfig.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isAuthenticated, attemptRefresh, mergedConfig.interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...refreshState,
    manualRefresh: () => attemptRefresh(0),
  };
};
