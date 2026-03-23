/**
 * Enhanced async hook with automatic error handling
 * Combines useAsyncOperation with useErrorNotification
 */

import { useCallback, useState } from 'react';
import { useErrorNotification } from './useErrorNotification';
import { logger } from '../utils/logger';

export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncWithErrorHandlingOptions {
  /** Show error toast (default: true) */
  showErrorToast?: boolean;
  /** Duration for error toast in ms (default: 4000) */
  toastDuration?: number;
  /** Log errors (default: true) */
  logErrors?: boolean;
  /** Callback on success */
  onSuccess?: (data: any) => void;
  /** Callback on error */
  onError?: (error: any) => void;
}

export const useAsyncWithErrorHandling = <T = any>(
  options: UseAsyncWithErrorHandlingOptions = {}
) => {
  const {
    showErrorToast = true,
    toastDuration = 4000,
    logErrors = true,
    onSuccess,
    onError,
  } = options;

  const { notifyError } = useErrorNotification();

  const [state, setState] = useState<AsyncState>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any | null>(null);

  /**
   * Execute async operation with error handling
   */
  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setState('loading');
      setError(null);

      try {
        const result = await operation();
        setData(result);
        setState('success');
        
        if (onSuccess) {
          onSuccess(result);
        }

        // Auto-clear after success
        setTimeout(() => {
          setState('idle');
          setData(null);
        }, 2000);

        return result;
      } catch (err) {
        // Log error
        if (logErrors) {
          logger.error('Async operation failed', err);
        }

        setError(err);
        setState('error');

        // Show error notification
        if (showErrorToast) {
          notifyError(err, {
            duration: toastDuration,
            logError: false, // Already logged above
          });
        }

        if (onError) {
          onError(err);
        }

        return null;
      }
    },
    [showErrorToast, toastDuration, logErrors, notifyError, onSuccess, onError]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState('idle');
    setData(null);
    setError(null);
  }, []);

  /**
   * Retry last operation
   */
  const retry = useCallback(
    async (lastOperation: () => Promise<T>) => {
      return execute(lastOperation);
    },
    [execute]
  );

  return {
    state,
    data,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    execute,
    reset,
    retry,
  };
};
