/**
 * Hook para requisições com retry automático e exponential backoff
 * Integra-se com todos os outros hooks de performance
 */

import { useCallback, useRef, useState } from 'react';
import { logger } from '../utils/logger';

// Lazy import para evitar dependências React Native em testes
let useNetworkStatus: any = null;
try {
  useNetworkStatus = require('./useNetworkStatus').useNetworkStatus;
} catch {
  // Fallback para testes
  useNetworkStatus = () => ({ isOnline: true });
}

interface UseRequestWithRetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, delay: number) => void;
  onSuccess?: (data: any, attempts: number) => void;
  onFinalError?: (error: Error, attempts: number) => void;
}

/**
 * Hook para fazer requisições com retry automático
 */
export function useRequestWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: UseRequestWithRetryOptions = {}
) {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
    onRetry,
    onSuccess,
    onFinalError,
  } = options;

  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);

  const abortRef = useRef(false);

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const baseDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
      return Math.min(baseDelay, maxDelayMs);
    },
    [initialDelayMs, maxDelayMs, backoffMultiplier]
  );

  const execute = useCallback(async (): Promise<T | null> => {
    if (!isOnline) {
      const offlineError = new Error('No internet connection');
      setError(offlineError);
      onFinalError?.(offlineError, 0);
      return null;
    }

    abortRef.current = false;
    let lastError: Error | null = null;
    let attemptCount = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (abortRef.current) break;

      attemptCount = attempt + 1;
      setAttempts(attemptCount);
      setLoading(true);

      try {
        logger.debug(`Request attempt ${attemptCount}/${maxAttempts}`);
        const result = await fetchFn();

        setData(result);
        setError(null);
        setLoading(false);
        onSuccess?.(result, attemptCount);

        logger.debug(`Request succeeded on attempt ${attemptCount}`);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.warn(`Request failed on attempt ${attemptCount}:`, lastError);

        // Check if we should retry
        if (attempt < maxAttempts - 1 && shouldRetry(lastError, attemptCount)) {
          const delay = calculateDelay(attempt);
          onRetry?.(attemptCount, delay);
          logger.debug(`Retrying in ${delay}ms...`);

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // No more retries
          break;
        }
      }
    }

    // Final error
    if (lastError) {
      setError(lastError);
      setLoading(false);
      onFinalError?.(lastError, attemptCount);
      logger.error(
        `Request failed after ${attemptCount} attempts`,
        lastError
      );
    }

    return null;
  }, [
    isOnline,
    maxAttempts,
    fetchFn,
    calculateDelay,
    shouldRetry,
    onRetry,
    onSuccess,
    onFinalError,
  ]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  const abort = useCallback(() => {
    abortRef.current = true;
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    attempts,
    execute,
    retry,
    abort,
    canRetry: attempts < maxAttempts,
  };
}

/**
 * Default retry strategy
 */
function defaultShouldRetry(error: Error, attempt: number): boolean {
  const message = error.message.toLowerCase();

  // Network errors - always retry
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('enotfound')
  ) {
    return true;
  }

  // Check for specific error codes
  const errorObj = error as any;
  if (errorObj.code === 'NETWORK_ERROR' || errorObj.code === 'TIMEOUT') {
    return true;
  }

  // Check HTTP status codes
  if (errorObj.response?.status) {
    const status = errorObj.response.status;
    // 5xx errors - server errors, retry
    if (status >= 500) return true;
    // 429 - Too Many Requests, retry
    if (status === 429) return true;
    // 408 - Request Timeout, retry
    if (status === 408) return true;
    // 4xx - Client errors, don't retry
    if (status >= 400) return false;
  }

  // 3xx and other - don't retry
  return false;
}

/**
 * Hook para gerenciar múltiplas requisições com retry
 */
export function useMultiRequestWithRetry<T extends Record<string, any>>(
  requests: Record<keyof T, () => Promise<T[keyof T]>>,
  options: UseRequestWithRetryOptions = {}
) {
  const [allData, setAllData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>(
    {}
  );

  const execute = useCallback(async () => {
    setLoading(true);
    const newData: Partial<T> = {};
    const newErrors: Record<string, Error> = {};
    const newAttempts: Record<string, number> = {};

    await Promise.all(
      Object.entries(requests).map(async ([key, fetchFn]) => {
        let attempts = 0;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < (options.maxAttempts || 3); attempt++) {
          attempts = attempt + 1;

          try {
            const result = await fetchFn();
            newData[key as keyof T] = result;
            newAttempts[key] = attempts;
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (
              attempt < (options.maxAttempts || 3) - 1 &&
              defaultShouldRetry(lastError, attempts)
            ) {
              const delay = Math.min(
                (options.initialDelayMs || 500) *
                  Math.pow(options.backoffMultiplier || 2, attempt),
                options.maxDelayMs || 10000
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              break;
            }
          }
        }

        if (lastError) {
          newErrors[key] = lastError;
          newAttempts[key] = attempts;
        }
      })
    );

    setAllData(newData);
    setErrors(newErrors);
    setAttemptCounts(newAttempts);
    setLoading(false);
  }, [requests, options]);

  return {
    data: allData,
    loading,
    errors,
    attempts: attemptCounts,
    execute,
    refetch: () => execute(),
    hasErrors: Object.keys(errors).length > 0,
  };
}

export default useRequestWithRetry;
