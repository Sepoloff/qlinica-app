/**
 * Error Message Mapping
 * Provides user-friendly error messages for common errors
 */

import { AxiosError } from 'axios';

export interface ErrorInfo {
  message: string;
  code: string;
  userMessage: string;
  suggestion: string;
  isRetryable: boolean;
}

/**
 * Map HTTP status codes to user-friendly messages
 */
const HTTP_ERROR_MAP: Record<number, Omit<ErrorInfo, 'code'>> = {
  400: {
    message: 'Bad Request - Invalid data',
    userMessage: 'Os dados enviados não são válidos',
    suggestion: 'Verifique se preencheu todos os campos corretamente',
    isRetryable: false,
  },
  401: {
    message: 'Unauthorized - Invalid credentials',
    userMessage: 'Credenciais inválidas',
    suggestion: 'Faça login novamente com as suas credenciais',
    isRetryable: false,
  },
  403: {
    message: 'Forbidden - Access denied',
    userMessage: 'Acesso negado',
    suggestion: 'Não tem permissão para realizar esta ação',
    isRetryable: false,
  },
  404: {
    message: 'Not Found - Resource not found',
    userMessage: 'Recurso não encontrado',
    suggestion: 'O item que procura pode ter sido removido',
    isRetryable: false,
  },
  409: {
    message: 'Conflict - Resource conflict',
    userMessage: 'Conflito de dados',
    suggestion: 'Este email já está registado. Tente fazer login',
    isRetryable: false,
  },
  422: {
    message: 'Unprocessable Entity - Validation error',
    userMessage: 'Dados inválidos',
    suggestion: 'Verifique os dados e tente novamente',
    isRetryable: false,
  },
  429: {
    message: 'Too Many Requests - Rate limited',
    userMessage: 'Muitas tentativas',
    suggestion: 'Aguarde alguns minutos e tente novamente',
    isRetryable: true,
  },
  500: {
    message: 'Server Error - Internal server error',
    userMessage: 'Erro no servidor',
    suggestion: 'Tente novamente mais tarde',
    isRetryable: true,
  },
  502: {
    message: 'Bad Gateway',
    userMessage: 'Erro de conexão',
    suggestion: 'Verifique a sua conexão e tente novamente',
    isRetryable: true,
  },
  503: {
    message: 'Service Unavailable',
    userMessage: 'Serviço indisponível',
    suggestion: 'O serviço está temporariamente indisponível. Tente mais tarde',
    isRetryable: true,
  },
  504: {
    message: 'Gateway Timeout',
    userMessage: 'Pedido expirado',
    suggestion: 'Verifique a sua conexão e tente novamente',
    isRetryable: true,
  },
};

/**
 * Map error codes to user-friendly messages
 */
const ERROR_CODE_MAP: Record<string, Omit<ErrorInfo, 'code'>> = {
  ECONNABORTED: {
    message: 'Connection aborted',
    userMessage: 'Conexão interrompida',
    suggestion: 'Verifique a sua conexão à internet',
    isRetryable: true,
  },
  ECONNREFUSED: {
    message: 'Connection refused',
    userMessage: 'Conexão recusada',
    suggestion: 'Verifique se a sua conexão à internet está ativa',
    isRetryable: true,
  },
  ENOTFOUND: {
    message: 'Host not found',
    userMessage: 'Servidor não encontrado',
    suggestion: 'Verifique a sua conexão à internet',
    isRetryable: true,
  },
  ETIMEDOUT: {
    message: 'Connection timeout',
    userMessage: 'Pedido expirou',
    suggestion: 'Verifique a sua conexão e tente novamente',
    isRetryable: true,
  },
  NETWORK_ERROR: {
    message: 'Network error',
    userMessage: 'Erro de rede',
    suggestion: 'Verifique a sua conexão à internet',
    isRetryable: true,
  },
  VALIDATION_ERROR: {
    message: 'Validation error',
    userMessage: 'Dados inválidos',
    suggestion: 'Verifique os dados que introduziu',
    isRetryable: false,
  },
  AUTH_ERROR: {
    message: 'Authentication error',
    userMessage: 'Erro de autenticação',
    suggestion: 'Faça login novamente',
    isRetryable: false,
  },
  UNKNOWN_ERROR: {
    message: 'Unknown error',
    userMessage: 'Erro desconhecido',
    suggestion: 'Tente novamente mais tarde',
    isRetryable: true,
  },
};

/**
 * Parse an error and return structured error info
 */
export const parseError = (error: any): ErrorInfo => {
  let code = 'UNKNOWN_ERROR';
  let userMessage = 'Ocorreu um erro inesperado';
  let suggestion = 'Tente novamente mais tarde';
  let isRetryable = true;

  // Handle Axios errors
  if (error.response) {
    // HTTP error
    const status = error.response.status;
    const statusMap = HTTP_ERROR_MAP[status];

    if (statusMap) {
      code = `HTTP_${status}`;
      userMessage = statusMap.userMessage;
      suggestion = statusMap.suggestion;
      isRetryable = statusMap.isRetryable;
    }

    // Check for specific error message from server
    if (error.response.data?.message) {
      userMessage = error.response.data.message;
    }
  } else if (error.request && !error.response) {
    // Request made but no response
    code = 'NETWORK_ERROR';
    const errorCodeMap = ERROR_CODE_MAP[code];
    userMessage = errorCodeMap.userMessage;
    suggestion = errorCodeMap.suggestion;
    isRetryable = errorCodeMap.isRetryable;
  } else if (error.code) {
    // Error code provided
    const codeMap = ERROR_CODE_MAP[error.code];
    if (codeMap) {
      code = error.code;
      userMessage = codeMap.userMessage;
      suggestion = codeMap.suggestion;
      isRetryable = codeMap.isRetryable;
    }
  }

  // Check for custom error message
  if (error.message) {
    // Only use custom message if it's not a generic axios message
    if (
      !error.message.includes('status code') &&
      !error.message.includes('timeout') &&
      error.message.length < 200
    ) {
      userMessage = error.message;
    }
  }

  return {
    message: error.message || 'Unknown error',
    code,
    userMessage,
    suggestion,
    isRetryable,
  };
};

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (error: any): string => {
  const errorInfo = parseError(error);
  return errorInfo.userMessage;
};

/**
 * Get error suggestion
 */
export const getErrorSuggestion = (error: any): string => {
  const errorInfo = parseError(error);
  return errorInfo.suggestion;
};

/**
 * Check if error is retryable
 */
export const isErrorRetryable = (error: any): boolean => {
  const errorInfo = parseError(error);
  return errorInfo.isRetryable;
};

/**
 * Validate error shape
 */
export const isValidError = (error: any): error is Error | AxiosError => {
  return error instanceof Error || (error && error.message);
};

/**
 * Get all error info
 */
export const getErrorInfo = (error: any): ErrorInfo => {
  if (!isValidError(error)) {
    return ERROR_CODE_MAP['UNKNOWN_ERROR'] as any;
  }
  return parseError(error);
};
