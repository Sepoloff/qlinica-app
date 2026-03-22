'use strict';

import { useState, useCallback, useRef } from 'react';
import { handleError, AppError } from '../utils/errorHandler';

interface AsyncOperationState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: AppError | null;
  progress: number;
  successMessage?: string;
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: AppError) => void;
  showProgress?: boolean;
  timeout?: number;
}

/**
 * Custom hook for managing async operations with loading, error, and progress states
 * 
 * @example
 * const { execute, isLoading, error, progress } = useAsyncOperation();
 * 
 * const handleLogin = () => {
 *   execute(async () => {
 *     return await authService.login(email, password);
 *   }, {
 *     onSuccess: () => navigate('home'),
 *     onError: (error) => showToast(error.userMessage),
 *   });
 * };
 */
export const useAsyncOperation = (options?: UseAsyncOperationOptions) => {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    progress: 0,
  });

  const isMountedRef = useRef(true);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      operationOptions?: UseAsyncOperationOptions
    ): Promise<T | null> => {
      const mergedOptions = { ...options, ...operationOptions };

      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        progress: 0,
      });

      // Set timeout if specified
      if (mergedOptions.timeout) {
        timeoutIdRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            const timeoutError = new Error('Operation timeout');
            const appError = handleError(timeoutError);
            setState({
              isLoading: false,
              isSuccess: false,
              isError: true,
              error: appError,
              progress: 0,
            });
            mergedOptions.onError?.(appError);
          }
        }, mergedOptions.timeout);
      }

      try {
        const result = await operation();

        if (!isMountedRef.current) return null;

        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          progress: 100,
          successMessage: 'Operação concluída com sucesso',
        });

        mergedOptions.onSuccess?.(result);

        // Clear success state after 2 seconds
        const successTimeout = setTimeout(() => {
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              isSuccess: false,
              successMessage: undefined,
            }));
          }
        }, 2000);

        return result;
      } catch (error: any) {
        if (!isMountedRef.current) return null;

        const appError = handleError(error);

        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: appError,
          progress: 0,
        });

        mergedOptions.onError?.(appError);
        return null;
      } finally {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
      }
    },
    [options]
  );

  const resetError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isError: false,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    execute,
    resetError,
    reset,
  };
};

export default useAsyncOperation;
