'use strict';

import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

export interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  fields?: Record<string, string>;
  timestamp?: number;
}

/**
 * Hook for comprehensive error handling
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const parseError = useCallback((err: any): ErrorDetails => {
    const errorObj: ErrorDetails = {
      message: 'An unexpected error occurred',
      timestamp: Date.now(),
    };

    if (err instanceof AxiosError) {
      errorObj.status = err.response?.status;

      if (err.response?.data) {
        const data = err.response.data as any;
        errorObj.message = data.message || data.error || errorObj.message;
        errorObj.code = data.code;
        errorObj.fields = data.fields || data.errors;
      }

      // Handle specific HTTP status codes
      switch (err.response?.status) {
        case 400:
          errorObj.message = errorObj.message || 'Invalid request data';
          break;
        case 401:
          errorObj.message = 'Session expired. Please login again';
          break;
        case 403:
          errorObj.message = 'You do not have permission to perform this action';
          break;
        case 404:
          errorObj.message = 'Resource not found';
          break;
        case 409:
          errorObj.message = 'This resource already exists';
          break;
        case 422:
          errorObj.message = 'Validation failed. Please check your inputs';
          break;
        case 429:
          errorObj.message = 'Too many requests. Please try again later';
          break;
        case 500:
          errorObj.message = 'Server error. Please try again later';
          break;
        case 503:
          errorObj.message = 'Service temporarily unavailable. Please try again later';
          break;
      }
    } else if (err instanceof Error) {
      errorObj.message = err.message;
    } else if (typeof err === 'string') {
      errorObj.message = err;
    }

    return errorObj;
  }, []);

  const handleError = useCallback((err: any): ErrorDetails => {
    const errorDetails = parseError(err);
    setError(errorDetails);
    return errorDetails;
  }, [parseError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasFieldError = useCallback((fieldName: string): string | undefined => {
    return error?.fields?.[fieldName];
  }, [error]);

  return {
    error,
    handleError,
    clearError,
    hasFieldError,
    isNetworkError: error?.status === undefined && error?.message.includes('network'),
    isAuthError: error?.status === 401 || error?.status === 403,
    isValidationError: error?.status === 422 || error?.status === 400,
  };
};
