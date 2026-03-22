'use strict';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
  autoLoad?: boolean;
  dependencies?: any[];
}

interface UseAsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (params?: any) => Promise<void>;
  reset: () => void;
  isIdle: boolean;
}

/**
 * Hook for managing async operations
 * 
 * @example
 * const { data, loading, error, refetch } = useAsync(
 *   () => bookingService.getBookings(),
 *   { autoLoad: true }
 * );
 */
export const useAsync = <T = any,>(
  asyncFunction: (params?: any) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncState<T> => {
  const {
    onSuccess,
    onError,
    onFinally,
    autoLoad = false,
    dependencies = [],
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
    isIdle: boolean;
  }>({
    data: null,
    loading: autoLoad,
    error: null,
    isIdle: !autoLoad,
  });

  const isMountedRef = useRef(true);

  const refetch = useCallback(
    async (params?: any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await asyncFunction(params);

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            data: response,
            loading: false,
            isIdle: false,
          }));
          onSuccess?.(response);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: err,
            loading: false,
            isIdle: false,
          }));
          onError?.(err);
        }
      } finally {
        onFinally?.();
      }
    },
    [asyncFunction, onSuccess, onError, onFinally]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (autoLoad) {
      refetch();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isIdle: true,
    });
  }, []);

  return {
    ...state,
    refetch,
    reset,
  };
};
