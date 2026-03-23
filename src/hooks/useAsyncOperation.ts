import { useState, useCallback } from 'react';

type OperationState = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncOperationResult<T> {
  state: OperationState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setError: (error: Error | string) => void;
}

/**
 * Hook for managing async operations with simplified state
 * Handles loading, success, and error states automatically
 * 
 * @example
 * const { state, error, data, execute } = useAsyncOperation<string>();
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     return await someAsyncFunction();
 *   });
 * };
 */
export const useAsyncOperation = <T = any>(): UseAsyncOperationResult<T> => {
  const [state, setState] = useState<OperationState>('idle');
  const [error, setErrorState] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    setState('loading');
    setErrorState(null);
    setData(null);

    try {
      const result = await fn();
      setData(result);
      setState('success');
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorState(error);
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setErrorState(null);
    setData(null);
  }, []);

  const setError = useCallback((err: Error | string) => {
    const error = typeof err === 'string' ? new Error(err) : err;
    setErrorState(error);
    setState('error');
  }, []);

  return {
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    error,
    data,
    execute,
    reset,
    setError,
  };
};
