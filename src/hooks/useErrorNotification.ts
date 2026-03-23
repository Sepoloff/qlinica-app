/**
 * Hook for better error notifications
 * Integrates with API error handler and toast system
 */

import { useCallback } from 'react';
import { useToast } from './useToast';
import { parseAPIError, isRetryableError } from '../utils/apiErrorHandler';
import { logger } from '../utils/logger';

export interface ErrorNotificationOptions {
  /** Log the error (default: true) */
  logError?: boolean;
  /** Duration for toast in milliseconds (default: 4000) */
  duration?: number;
  /** Custom fallback message if error parsing fails */
  fallback?: string;
  /** Show specific error code in message (default: false) */
  includeCode?: boolean;
}

export const useErrorNotification = () => {
  const { error: showErrorToast } = useToast();

  /**
   * Show error notification from any error type
   */
  const notifyError = useCallback(
    (error: any, options: ErrorNotificationOptions = {}) => {
      const {
        logError = true,
        duration = 4000,
        fallback = 'Algo correu mal. Por favor, tente novamente.',
        includeCode = false,
      } = options;

      try {
        // Parse error using API error handler
        const parsed = parseAPIError(error);
        
        // Log if requested
        if (logError) {
          logger.error('Error notification', {
            code: parsed.code,
            message: parsed.message,
            statusCode: parsed.statusCode,
            isRetryable: isRetryableError(parsed),
          });
        }

        // Build message
        let message = parsed.message;
        if (includeCode && parsed.code !== 'UNKNOWN_ERROR') {
          message = `${message} (${parsed.code})`;
        }

        // Show toast
        showErrorToast(message, duration);

        return {
          code: parsed.code,
          message: parsed.message,
          isRetryable: isRetryableError(parsed),
          statusCode: parsed.statusCode,
        };
      } catch (handlingError) {
        // Fallback if error handler fails
        logger.error('Error notification handler failed', handlingError);
        showErrorToast(fallback, duration);

        return {
          code: 'UNKNOWN_ERROR',
          message: fallback,
          isRetryable: false,
          statusCode: 0,
        };
      }
    },
    [showErrorToast]
  );

  /**
   * Show error and check if retryable
   */
  const notifyErrorWithRetry = useCallback(
    (error: any, onRetry: () => void, options: ErrorNotificationOptions = {}) => {
      const result = notifyError(error, options);
      
      if (result.isRetryable) {
        logger.debug(`Error is retryable: ${result.code}`);
        // Could trigger automatic retry logic here
      }

      return result;
    },
    [notifyError]
  );

  /**
   * Notify specific error types
   */
  const notifyNetworkError = useCallback(() => {
    showErrorToast('Verifique a sua conexão à internet e tente novamente', 5000);
  }, [showErrorToast]);

  const notifyAuthError = useCallback(() => {
    showErrorToast('Sessão expirada. Por favor, inicie sessão novamente', 4000);
  }, [showErrorToast]);

  const notifyValidationError = useCallback((message: string = 'Verifique os campos do formulário') => {
    showErrorToast(message, 3000);
  }, [showErrorToast]);

  return {
    notifyError,
    notifyErrorWithRetry,
    notifyNetworkError,
    notifyAuthError,
    notifyValidationError,
  };
};
