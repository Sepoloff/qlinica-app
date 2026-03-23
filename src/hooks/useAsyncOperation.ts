/**
 * useAsyncOperation
 * Manages async operations with loading, error, and data states
 */

import { useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export const useAsyncOperation = <T,>(
  asyncFunction: () => Promise<T>,
  options: AsyncOperationOptions = {}
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (overrideOptions?: AsyncOperationOptions) => {
      const mergedOptions = { ...options, ...overrideOptions };

      try {
        setState({ data: null, loading: true, error: null });

        // Execute with optional timeout
        const promise = asyncFunction();
        let result: T;

        if (mergedOptions.timeout) {
          result = await Promise.race([
            promise,
            new Promise<T>((_, reject) =>
              setTimeout(
                () => reject(new Error('Operation timeout')),
                mergedOptions.timeout
              )
            ),
          ]);
        } else {
          result = await promise;
        }

        if (isMountedRef.current) {
          setState({ data: result, loading: false, error: null });
          mergedOptions.onSuccess?.(result);
          logger.debug('Async operation completed', { hasData: !!result });
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({ data: null, loading: false, error: err });
          mergedOptions.onError?.(err);
          logger.trackError('Async operation failed', err);
        }

        throw err;
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.error && !!state.data,
  };
};
