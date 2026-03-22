import { useState, useCallback, useRef } from 'react';

interface UseAsyncStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export const useAsyncState = <T,>(options: UseAsyncStateOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction();

        if (isMounted.current) {
          setData(result);
          options.onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');

        if (isMounted.current) {
          setError(error);
          options.onError?.(error);
        }

        throw error;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const cleanup = useCallback(() => {
    isMounted.current = false;
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    cleanup,
    isSuccess: !loading && !error && data !== null,
  };
};
