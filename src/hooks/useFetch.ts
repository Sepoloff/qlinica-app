/**
 * useFetch Hook
 * Centralized data fetching with error handling, loading states, and retries
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';
import { useNetworkStatus } from '../utils/networkStatus';
import { MESSAGES } from '../constants/Messages';

export interface FetchOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | string) => void;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  skip?: boolean; // Don't fetch automatically
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | string | null;
  retry: () => Promise<void>;
}

/**
 * Hook for fetching data with automatic error handling
 */
export const useFetch = <T = any,>(
  fetchFn: () => Promise<T>,
  options?: FetchOptions<T>
): FetchState<T> => {
  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<Error | string | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    onSuccess,
    onError,
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    skip = false,
  } = options || {};

  const performFetch = useCallback(async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      // Check network connection
      if (!isOnline) {
        throw new Error(MESSAGES.NETWORK.NO_CONNECTION);
      }

      // Set timeout
      const fetchPromise = Promise.race([
        fetchFn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(MESSAGES.NETWORK.TIMEOUT)), timeout)
        ),
      ]);

      const result = await fetchPromise;
      setData(result);
      setError(null);
      attemptsRef.current = 0;

      // Track successful fetch
      analyticsService.trackEvent('fetch_success', {
        dataSize: typeof result === 'string' ? result.length : 'unknown',
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      attemptsRef.current += 1;

      // Retry logic
      if (attemptsRef.current < retries) {
        const delay = retryDelay * Math.pow(2, attemptsRef.current - 1);
        console.log(`Fetch failed. Retrying in ${delay}ms (${attemptsRef.current}/${retries})`);

        analyticsService.trackEvent('fetch_retry', {
          attempt: attemptsRef.current,
          error: error.message,
          nextDelay: delay,
        });

        timeoutRef.current = setTimeout(() => {
          performFetch();
        }, delay);
      } else {
        // All retries exhausted
        setError(error);
        setData(null);

        analyticsService.trackError(error, {
          operation: 'useFetch',
          totalAttempts: attemptsRef.current,
        });

        if (onError) {
          onError(error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, isOnline, retries, retryDelay, timeout, skip, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (!skip) {
      performFetch();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const retry = useCallback(async () => {
    attemptsRef.current = 0;
    await performFetch();
  }, [performFetch]);

  return { data, loading, error, retry };
};

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export interface MutationOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | string) => void;
  timeout?: number;
}

export interface MutationState<T> {
  loading: boolean;
  error: Error | string | null;
  mutate: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useMutation = <T = any,>(
  options?: MutationOptions<T>
): MutationState<T> => {
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const { onSuccess, onError, timeout = 10000 } = options || {};

  const mutate = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    if (!isOnline) {
      const networkError = MESSAGES.NETWORK.NO_CONNECTION;
      setError(networkError);
      if (onError) onError(networkError);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(MESSAGES.NETWORK.TIMEOUT)), timeout)
        ),
      ]);

      setError(null);
      analyticsService.trackEvent('mutation_success');

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      analyticsService.trackError(error, {
        operation: 'useMutation',
      });

      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [isOnline, timeout, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, mutate, reset };
};
