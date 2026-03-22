import { AxiosError } from 'axios';

export class APIError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number, code: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle and parse API errors
 */
export const handleAPIError = (error: any): APIError => {
  // Network error
  if (!error.response) {
    return new APIError(
      error.message || 'Network error. Please check your connection.',
      0,
      'NETWORK_ERROR',
      error
    );
  }

  const { status, data } = error.response;

  // Parse error message from various formats
  const message =
    typeof data === 'string'
      ? data
      : data?.message || data?.error || `Error ${status}`;

  // Map common HTTP errors
  const errorMap: Record<number, { message: string; code: string }> = {
    400: {
      message: 'Invalid request. Please check your input.',
      code: 'BAD_REQUEST',
    },
    401: {
      message: 'Unauthorized. Please log in again.',
      code: 'UNAUTHORIZED',
    },
    403: {
      message: 'Forbidden. You do not have permission.',
      code: 'FORBIDDEN',
    },
    404: {
      message: 'Resource not found.',
      code: 'NOT_FOUND',
    },
    409: {
      message: 'Conflict. This resource already exists.',
      code: 'CONFLICT',
    },
    429: {
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
    },
    500: {
      message: 'Server error. Please try again later.',
      code: 'SERVER_ERROR',
    },
    503: {
      message: 'Service unavailable. Please try again later.',
      code: 'SERVICE_UNAVAILABLE',
    },
  };

  const errorInfo = errorMap[status] || {
    message,
    code: `HTTP_${status}`,
  };

  return new APIError(errorInfo.message, status, errorInfo.code, data);
};

/**
 * Log API errors for debugging
 */
export const logAPIError = (error: APIError, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    status: error.status,
    code: error.code,
    message: error.message,
    details: error.details,
  };

  console.error('[API Error]', errorLog);

  // In production, you might want to send this to a logging service
  // sendToSentry(errorLog);
};

/**
 * User-friendly error messages
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
