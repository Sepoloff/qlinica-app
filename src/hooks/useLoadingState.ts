'use strict';

import { useState, useCallback } from 'react';

interface LoadingStateOptions {
  initialState?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useLoadingState = (options: LoadingStateOptions = {}) => {
  const { initialState = false, onError, onSuccess } = options;
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      shouldClear = true
    ): Promise<T | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFn();
        if (shouldClear) {
          setIsLoading(false);
        }
        onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        setIsLoading(false);
        throw error;
      }
    },
    [onError, onSuccess]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const setErrorManually = useCallback((err: Error | null) => {
    setError(err);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
    setErrorManually,
    setIsLoading,
  };
};
