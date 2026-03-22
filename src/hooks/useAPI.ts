import { useState, useCallback, useRef } from 'react';
import { useQuickToast } from './useToast';
import { APIError, handleAPIError, getErrorMessage } from '../services/errorHandler';

export interface UseAPIOptions {
  onError?: (error: APIError) => void;
  onSuccess?: () => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
}

export interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
}

/**
 * Hook para gerenciar chamadas de API com loading e error states
 */
export const useAPI = <T,>(
  asyncFunction: () => Promise<T>,
  options: UseAPIOptions = {}
) => {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const toast = useQuickToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (onSuccess?: (data: T) => void) => {
      setState({ data: null, loading: true, error: null });
      abortControllerRef.current = new AbortController();

      try {
        const result = await asyncFunction();
        setState({ data: result, loading: false, error: null });

        if (options.showSuccessToast) {
          toast.success('Operation successful');
        }

        if (options.onSuccess) {
          options.onSuccess();
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const apiError = err instanceof APIError ? err : handleAPIError(err);
        setState({ data: null, loading: false, error: apiError });

        if (options.showErrorToast) {
          toast.error(getErrorMessage(apiError));
        }

        if (options.onError) {
          options.onError(apiError);
        }

        throw apiError;
      }
    },
    [asyncFunction, options, toast]
  );

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    retry,
    clearError,
  };
};

/**
 * Hook para gerenciar múltiplas chamadas de API sequencialmente
 */
export const useSequentialAPI = <T,>(
  asyncFunctions: (() => Promise<T>)[],
  options: UseAPIOptions = {}
) => {
  const [state, setState] = useState<UseAPIState<T[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const toast = useQuickToast();

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const results: T[] = [];

      for (const fn of asyncFunctions) {
        try {
          const result = await fn();
          results.push(result);
        } catch (err: any) {
          const apiError = err instanceof APIError ? err : handleAPIError(err);
          throw apiError;
        }
      }

      setState({ data: results, loading: false, error: null });

      if (options.showSuccessToast) {
        toast.success('All operations completed successfully');
      }

      if (options.onSuccess) {
        options.onSuccess();
      }

      return results;
    } catch (err: any) {
      const apiError = err instanceof APIError ? err : handleAPIError(err);
      setState({ data: null, loading: false, error: apiError });

      if (options.showErrorToast) {
        toast.error(getErrorMessage(apiError));
      }

      if (options.onError) {
        options.onError(apiError);
      }

      throw apiError;
    }
  }, [asyncFunctions, options, toast]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data: state.data || [],
    loading: state.loading,
    error: state.error,
    execute,
    retry,
  };
};
