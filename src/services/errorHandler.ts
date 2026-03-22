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

  // Map common HTTP errors with Portuguese messages
  const errorMap: Record<number, { message: string; code: string }> = {
    400: {
      message: 'Pedido inválido. Verifique os dados inseridos.',
      code: 'BAD_REQUEST',
    },
    401: {
      message: 'Sessão expirada. Faça login novamente.',
      code: 'UNAUTHORIZED',
    },
    403: {
      message: 'Sem permissão para executar esta ação.',
      code: 'FORBIDDEN',
    },
    404: {
      message: 'Recurso não encontrado.',
      code: 'NOT_FOUND',
    },
    409: {
      message: 'Este recurso já existe ou entrou em conflito.',
      code: 'CONFLICT',
    },
    422: {
      message: 'Dados inválidos. Verifique os campos preenchidos.',
      code: 'UNPROCESSABLE_ENTITY',
    },
    429: {
      message: 'Muitos pedidos. Tente novamente em alguns instantes.',
      code: 'RATE_LIMITED',
    },
    500: {
      message: 'Erro no servidor. Tente novamente mais tarde.',
      code: 'SERVER_ERROR',
    },
    503: {
      message: 'Serviço indisponível. Tente novamente mais tarde.',
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
