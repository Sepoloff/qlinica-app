'use strict';

/**
 * useAsyncOperationState Hook
 * Provides comprehensive state management for async operations
 * Handles loading, error, success states with automatic cleanup
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface AsyncOperationState<T> {
  status: OperationStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOperationStateReturn<T> extends AsyncOperationState<T> {
  execute: <TArgs extends any[]>(
    fn: (...args: TArgs) => Promise<T>,
    ...args: TArgs
  ) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error | string) => void;
}

const initialState = <T>(): AsyncOperationState<T> => ({
  status: 'idle',
  data: null,
  error: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
});

export const useAsyncOperationState = <T = any>(
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void,
  resetDelayMs?: number
): UseAsyncOperationStateReturn<T> => {
  const [state, setState] = useState<AsyncOperationState<T>>(initialState());
  const isMountedRef = useRef(true);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  // Execute async operation
  const execute = useCallback(
    async <TArgs extends any[]>(
      fn: (...args: TArgs) => Promise<T>,
      ...args: TArgs
    ): Promise<T> => {
      try {
        if (!isMountedRef.current) return null as any;

        setState({
          status: 'pending',
          data: null,
          error: null,
          isLoading: true,
          isSuccess: false,
          isError: false,
        });

        const result = await fn(...args);

        if (!isMountedRef.current) return result;

        setState({
          status: 'success',
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        // Call success callback
        onSuccess?.(result);

        // Auto-reset after delay if provided
        if (resetDelayMs && resetDelayMs > 0) {
          resetTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setState(initialState());
            }
          }, resetDelayMs);
        }

        return result;
      } catch (err: any) {
        if (!isMountedRef.current) throw err;

        const error = err instanceof Error ? err : new Error(String(err));

        setState({
          status: 'error',
          data: null,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        // Call error callback
        onError?.(error);

        throw error;
      }
    },
    [onSuccess, onError, resetDelayMs]
  );

  // Reset state to initial
  const reset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    if (isMountedRef.current) {
      setState(initialState());
    }
  }, []);

  // Manually set data
  const setData = useCallback((data: T) => {
    if (isMountedRef.current) {
      setState({
        status: 'success',
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
    }
  }, []);

  // Manually set error
  const setError = useCallback((error: Error | string) => {
    const err = error instanceof Error ? error : new Error(error);
    if (isMountedRef.current) {
      setState({
        status: 'error',
        data: null,
        error: err,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
};
