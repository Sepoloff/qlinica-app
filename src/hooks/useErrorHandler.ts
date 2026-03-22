/**
 * useErrorHandler Hook
 * Provides error handling utilities with consistent formatting
 */

import { useState, useCallback } from 'react';
import {
  parseError,
  logError,
  getErrorMessage,
  isRetryable,
  requiresReauth,
  getFieldErrors,
  AppError,
} from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';
import { useQuickToast } from './useToast';

interface UseErrorHandlerReturn {
  error: AppError | null;
  setError: (error: any) => void;
  clearError: () => void;
  handleError: (error: any, context?: Record<string, any>) => void;
  getDisplayMessage: () => string;
  isRetryable: () => boolean;
  getFieldErrors: () => Record<string, string>;
}

/**
 * Hook for centralized error handling
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<AppError | null>(null);
  const { logout } = useAuth();
  const toast = useQuickToast();

  const setError = useCallback((rawError: any) => {
    const parsedError = parseError(rawError);
    setErrorState(parsedError);
    return parsedError;
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback(
    (rawError: any, context?: Record<string, any>) => {
      const parsedError = parseError(rawError);
      setErrorState(parsedError);

      // Log error
      logError(parsedError, context);

      // Check if re-authentication is needed
      if (requiresReauth(parsedError)) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        logout();
        return;
      }

      // Show toast notification
      const message = getErrorMessage(parsedError);
      toast.error(message);
    },
    [logout, toast]
  );

  const getDisplayMessage = useCallback((): string => {
    return error ? getErrorMessage(error) : '';
  }, [error]);

  const isRetryableError = useCallback((): boolean => {
    return error ? isRetryable(error) : false;
  }, [error]);

  const getFieldErrorsMap = useCallback((): Record<string, string> => {
    return error ? getFieldErrors(error) : {};
  }, [error]);

  return {
    error,
    setError,
    clearError,
    handleError,
    getDisplayMessage,
    isRetryable: isRetryableError,
    getFieldErrors: getFieldErrorsMap,
  };
};

/**
 * Simplified hook for just displaying errors
 */
export const useSimpleErrorHandler = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleError = useCallback((error: any) => {
    const parsedError = parseError(error);
    setErrorMessage(getErrorMessage(parsedError));
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage('');
  }, []);

  return {
    errorMessage,
    handleError,
    clearError,
    hasError: errorMessage.length > 0,
  };
};
