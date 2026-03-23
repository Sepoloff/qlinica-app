/**
 * Advanced API Error Handler
 * Converts API errors to user-friendly messages
 */

import axios, { AxiosError } from 'axios';
import { MESSAGES, getErrorMessage } from '../constants/Messages';

export interface APIErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

/**
 * Parse API error and return user-friendly message
 */
export const parseAPIError = (error: any): APIErrorResponse => {
  // Handle timeout
  if (error?.code === 'ECONNABORTED') {
    return {
      code: 'TIMEOUT',
      message: MESSAGES.NETWORK.TIMEOUT,
      statusCode: 408,
    };
  }

  // Handle no internet
  if (!error?.response && error?.message === 'Network Error') {
    return {
      code: 'NO_NETWORK',
      message: MESSAGES.NETWORK.NO_CONNECTION,
      statusCode: 0,
    };
  }

  // Handle axios error with response or plain response object (for testing)
  const response = error?.response || error;
  if (response?.status !== undefined) {
    const status = response.status;
    const data = response.data as any;
    const errorData = data || {};

    // Map common HTTP status codes
    if (status === 401 || status === 403) {
      return {
        code: 'UNAUTHORIZED',
        message: MESSAGES.AUTH.SESSION_EXPIRED,
        statusCode: status,
        details: errorData,
      };
    }

    if (status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: 'Muitas tentativas. Por favor, aguarde alguns minutos.',
        statusCode: status,
      };
    }

    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: MESSAGES.NETWORK.SERVER_ERROR,
        statusCode: status,
        details: errorData,
      };
    }

    if (status >= 400 && status < 500) {
      // Try to get specific error message from API response
      const apiMessage = 
        errorData?.message || 
        errorData?.error || 
        errorData?.errors?.[0]?.message ||
        getErrorMessage(status);

      return {
        code: `HTTP_${status}`,
        message: apiMessage,
        statusCode: status,
        details: errorData,
      };
    }
  }

  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: error?.message || MESSAGES.NETWORK.UNKNOWN_ERROR,
    statusCode: 0,
    details: error,
  };
};

/**
 * Determine if error is retryable
 */
export const isRetryableError = (error: APIErrorResponse): boolean => {
  const retryableCodes = [
    'TIMEOUT',
    'NO_NETWORK',
    'RATE_LIMIT',
    'SERVER_ERROR',
    'HTTP_408',
    'HTTP_429',
    'HTTP_500',
    'HTTP_502',
    'HTTP_503',
    'HTTP_504',
  ];

  return retryableCodes.includes(error.code);
};

/**
 * Determine if error is auth-related
 */
export const isAuthError = (error: APIErrorResponse): boolean => {
  const authCodes = ['UNAUTHORIZED', 'HTTP_401', 'HTTP_403'];
  return authCodes.includes(error.code);
};

/**
 * Format error for logging
 */
export const formatErrorForLog = (error: APIErrorResponse): string => {
  return `[${error.code}] ${error.message} (HTTP ${error.statusCode})`;
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: any): string => {
  const parsed = parseAPIError(error);
  return parsed.message;
};
