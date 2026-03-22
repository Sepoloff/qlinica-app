/**
 * Error Handler Utility
 * Centralized error handling and formatting for user-facing messages
 */

import { AxiosError } from 'axios';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
  retryable: boolean;
  details?: Record<string, any>;
}

/**
 * Parse various error types into consistent AppError format
 */
export const parseError = (error: any): AppError => {
  // Handle Axios errors
  if (error.isAxiosError || (error.response && error.config)) {
    return parseAxiosError(error as AxiosError);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 'ERROR',
      message: error.message,
      userMessage: formatErrorMessage(error.message),
      retryable: false,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'ERROR',
      message: error,
      userMessage: formatErrorMessage(error),
      retryable: false,
    };
  }

  // Handle unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error occurred',
    userMessage: 'Ocorreu um erro desconhecido. Tente novamente.',
    retryable: true,
  };
};

/**
 * Parse Axios/HTTP errors
 */
const parseAxiosError = (error: AxiosError): AppError => {
  const status = error.response?.status;
  const data = error.response?.data as any;

  // Network error
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      userMessage: 'Erro de rede. Verifique sua conexão e tente novamente.',
      retryable: true,
      details: {
        originalError: error.message,
      },
    };
  }

  // Map specific HTTP status codes
  switch (status) {
    case 400:
      return {
        code: 'VALIDATION_ERROR',
        message: data?.message || 'Validation failed',
        userMessage: data?.message || 'Os dados fornecidos são inválidos.',
        statusCode: 400,
        retryable: false,
        details: data?.errors,
      };

    case 401:
      return {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        userMessage: 'Sessão expirada. Por favor, faça login novamente.',
        statusCode: 401,
        retryable: false,
        details: {
          needsReauth: true,
        },
      };

    case 403:
      return {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        userMessage: 'Não tem permissão para realizar esta ação.',
        statusCode: 403,
        retryable: false,
      };

    case 404:
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        userMessage: 'O recurso solicitado não foi encontrado.',
        statusCode: 404,
        retryable: false,
      };

    case 409:
      return {
        code: 'CONFLICT',
        message: 'Resource conflict',
        userMessage: data?.message || 'Este recurso já existe. Tente com dados diferentes.',
        statusCode: 409,
        retryable: false,
      };

    case 429:
      return {
        code: 'RATE_LIMITED',
        message: 'Rate limited',
        userMessage: 'Muitas requisições. Aguarde um momento e tente novamente.',
        statusCode: 429,
        retryable: true,
        details: {
          retryAfter: error.response?.headers['retry-after'],
        },
      };

    case 500:
      return {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        userMessage: 'Erro do servidor. Tente novamente mais tarde.',
        statusCode: 500,
        retryable: true,
      };

    case 502:
    case 503:
    case 504:
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: `Service unavailable (${status})`,
        userMessage: 'Serviço temporariamente indisponível. Tente novamente.',
        statusCode: status,
        retryable: true,
      };

    default:
      return {
        code: 'HTTP_ERROR',
        message: data?.message || error.message || `HTTP ${status}`,
        userMessage: data?.message || `Erro HTTP ${status}. Tente novamente.`,
        statusCode: status,
        retryable: status >= 500,
      };
  }
};

/**
 * Format error messages to Portuguese
 */
const formatErrorMessage = (message: string): string => {
  const translations: Record<string, string> = {
    'Network Error': 'Erro de rede',
    'Timeout': 'Tempo limite excedido',
    'Invalid email': 'Email inválido',
    'Password too weak': 'Palavra-passe muito fraca',
    'User already exists': 'Utilizador já existe',
    'Invalid credentials': 'Credenciais inválidas',
    'Session expired': 'Sessão expirada',
    'Unauthorized': 'Não autorizado',
    'Not found': 'Não encontrado',
    'Conflict': 'Conflito',
  };

  // Try to find translation
  for (const [en, pt] of Object.entries(translations)) {
    if (message.toLowerCase().includes(en.toLowerCase())) {
      return pt;
    }
  }

  // Return original message if no translation found
  return message;
};

/**
 * Log error for analytics
 */
export const logError = (error: AppError, context?: Record<string, any>): void => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    context,
  };

  console.error('[ERROR]', JSON.stringify(errorLog, null, 2));

  // You can send this to analytics service here
  // analyticsService.trackError(error, context);
};

/**
 * User-friendly error message based on error code
 */
export const getErrorMessage = (error: AppError): string => {
  return error.userMessage || 'Ocorreu um erro. Tente novamente.';
};

/**
 * Check if error is retryable
 */
export const isRetryable = (error: AppError): boolean => {
  return error.retryable;
};

/**
 * Check if error requires re-authentication
 */
export const requiresReauth = (error: AppError): boolean => {
  return error.code === 'UNAUTHORIZED' || error.details?.needsReauth === true;
};

/**
 * Validation error helper - extract field errors
 */
export const getFieldErrors = (error: AppError): Record<string, string> => {
  if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
    return error.details.errors;
  }
  return {};
};
