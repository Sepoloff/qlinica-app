'use strict';

/**
 * Comprehensive Error Handling Utilities
 * 
 * Provides typed error responses, error categorization,
 * and user-friendly error messages
 */

export type ErrorType = 
  | 'VALIDATION'
  | 'NETWORK'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: Error;
  retryable: boolean;
  context?: Record<string, any>;
}

/**
 * Categorize error and provide user-friendly message
 */
export const handleError = (error: any, context?: string): AppError => {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.message?.includes('Network')) {
    return {
      type: 'NETWORK',
      message: error.message,
      userMessage: 'Problema de conexão. Verifique sua internet.',
      retryable: true,
      originalError: error,
      context: { context },
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: error.message,
      userMessage: 'Solicitação expirou. Tente novamente.',
      retryable: true,
      originalError: error,
      context: { context },
    };
  }

  // API errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          type: 'VALIDATION',
          message: data?.message || 'Validação falhou',
          userMessage: data?.message || 'Verifique os dados enviados.',
          statusCode: status,
          retryable: false,
          originalError: error,
          context: { context, validation: data?.errors },
        };

      case 401:
        return {
          type: 'AUTHENTICATION',
          message: 'Unauthorized',
          userMessage: 'Sessão expirada. Faça login novamente.',
          statusCode: status,
          retryable: true,
          originalError: error,
          context: { context },
        };

      case 403:
        return {
          type: 'AUTHORIZATION',
          message: 'Forbidden',
          userMessage: 'Você não tem permissão para esta ação.',
          statusCode: status,
          retryable: false,
          originalError: error,
          context: { context },
        };

      case 404:
        return {
          type: 'NOT_FOUND',
          message: 'Not found',
          userMessage: 'Recurso não encontrado.',
          statusCode: status,
          retryable: false,
          originalError: error,
          context: { context },
        };

      case 409:
        return {
          type: 'CONFLICT',
          message: 'Conflict',
          userMessage: data?.message || 'Conflito ao processar solicitação.',
          statusCode: status,
          retryable: false,
          originalError: error,
          context: { context },
        };

      case 500:
      case 502:
      case 503:
        return {
          type: 'SERVER',
          message: `Server error ${status}`,
          userMessage: 'Servidor indisponível. Tente mais tarde.',
          statusCode: status,
          retryable: true,
          originalError: error,
          context: { context },
        };

      default:
        return {
          type: 'SERVER',
          message: data?.message || `HTTP ${status}`,
          userMessage: 'Erro ao processar solicitação.',
          statusCode: status,
          retryable: true,
          originalError: error,
          context: { context },
        };
    }
  }

  // Generic error
  return {
    type: 'UNKNOWN',
    message: error.message || 'Unknown error',
    userMessage: 'Algo deu errado. Tente novamente.',
    retryable: true,
    originalError: error,
    context: { context },
  };
};

/**
 * Retry logic with exponential backoff
 */
export const retryAsync = async <T,>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      onRetry?.(attempt + 1, error);

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * Safe async execution with error handling
 */
export const safeAsync = async <T,>(
  fn: () => Promise<T>,
  onError?: (error: AppError) => void
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error: any) {
    const appError = handleError(error);
    onError?.(appError);
    return { data: null, error: appError };
  }
};

/**
 * Error recovery suggestion based on error type
 */
export const getSuggestedAction = (error: AppError): {
  action: 'retry' | 'reauth' | 'navigate' | 'wait' | 'contact';
  label: string;
  description: string;
} => {
  switch (error.type) {
    case 'NETWORK':
      return {
        action: 'retry',
        label: 'Tentar Novamente',
        description: 'Verifique sua conexão e tente novamente',
      };

    case 'AUTHENTICATION':
      return {
        action: 'reauth',
        label: 'Fazer Login',
        description: 'Sua sessão expirou',
      };

    case 'TIMEOUT':
      return {
        action: 'retry',
        label: 'Tentar Novamente',
        description: 'Operação demorou muito',
      };

    case 'SERVER':
      return {
        action: 'wait',
        label: 'Aguardar',
        description: 'Servidor indisponível, tente em alguns minutos',
      };

    case 'VALIDATION':
      return {
        action: 'navigate',
        label: 'Corrigir',
        description: 'Verifique os dados do formulário',
      };

    default:
      return {
        action: 'contact',
        label: 'Contacte Suporte',
        description: 'Algo inesperado aconteceu',
      };
  }
};

/**
 * Format error for logging
 */
export const formatErrorLog = (error: AppError): string => {
  return `
[${error.type}] ${error.message}
User Message: ${error.userMessage}
Status: ${error.statusCode || 'N/A'}
Retryable: ${error.retryable}
Context: ${JSON.stringify(error.context || {})}
  `.trim();
};

export default {
  handleError,
  retryAsync,
  safeAsync,
  getSuggestedAction,
  formatErrorLog,
};
