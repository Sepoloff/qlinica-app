'use strict';

import { useCallback, useState } from 'react';
import { logger } from '../utils/logger';

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onFinalError?: (error: Error) => void;
}

const DEFAULT_OPTIONS: ErrorRecoveryOptions = {
  maxRetries: 3,
  retryDelay: 500,
  backoffMultiplier: 2,
};

/**
 * Hook for handling errors with retry logic
 * 
 * Usage:
 * ```tsx
 * const { executeWithRetry, isRetrying, retryCount } = useErrorRecovery();
 * 
 * const loadData = async () => {
 *   await executeWithRetry(async () => {
 *     return await api.get('/data');
 *   }, { maxRetries: 3 });
 * };
 * ```
 */
export const useErrorRecovery = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options: ErrorRecoveryOptions = {}
    ): Promise<T | null> => {
      const {
        maxRetries = DEFAULT_OPTIONS.maxRetries ?? 3,
        retryDelay = DEFAULT_OPTIONS.retryDelay ?? 500,
        backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier ?? 2,
        onRetry,
        onFinalError,
      } = options;

      let lastErr: Error | null = null;
      let currentDelay = retryDelay;

      for (let attempt = 0; attempt <= (maxRetries ?? 3); attempt++) {
        try {
          setIsRetrying(attempt > 0);
          setRetryCount(attempt);

          const result = await fn();
          setLastError(null);
          setRetryCount(0);
          setIsRetrying(false);
          return result;
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          setLastError(lastErr);

          // Don't retry on last attempt
          if (attempt < maxRetries) {
            const isNetworkError =
              lastErr.message?.includes('Network') ||
              lastErr.message?.includes('timeout') ||
              lastErr.message?.includes('Failed to fetch');

            // Only retry on network errors or 5xx errors
            if (!isNetworkError && !lastErr.message?.includes('5')) {
              logger.warn(
                `Skipping retry for non-recoverable error: ${lastErr.message}`);
              break;
            }

            logger.warn(
              `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${currentDelay}ms: ${lastErr.message}`);

            onRetry?.(attempt + 1);
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= (backoffMultiplier ?? 2);
          }
        }
      }

      // All retries exhausted
      logger.error(
        `All ${maxRetries} retries failed`,
        lastErr as Error);
      onFinalError?.(lastErr as Error);
      setIsRetrying(false);
      return null;
    },
    []
  );

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    reset,
  };
};

/**
 * Wrapper for async operations with automatic error recovery
 */
export const withErrorRecovery = async <T,>(
  fn: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<{ success: boolean; data?: T; error?: Error }> => {
  const { executeWithRetry } = useErrorRecovery() as any;

  try {
    const data = await executeWithRetry(fn, options);
    return {
      success: !!data,
      data: data || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
