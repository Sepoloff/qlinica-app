'use strict';

import { useCallback } from 'react';
import { useQuickToast } from './useToast';
import { logger } from '../utils/logger';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  duration?: number;
  autoClose?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Hook for unified notification/feedback management
 * 
 * Combines toast notifications with logging for better UX and debugging
 * 
 * Usage:
 * ```tsx
 * const { success, error, info, warning } = useNotificationFeedback();
 * 
 * try {
 *   await api.post('/data');
 *   success('Dados salvos com sucesso!');
 * } catch (err) {
 *   error(err instanceof Error ? err.message : 'Erro ao salvar');
 * }
 * ```
 */
export const useNotificationFeedback = () => {
  const toast = useQuickToast();

  const notify = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      options: NotificationOptions = {}
    ) => {
      const {
        duration = 3000,
        autoClose = true,
        logLevel = 'info',
      } = options;

      // Log the notification
      const logMessage = `[${type.toUpperCase()}] ${message}`;
      
      switch (logLevel) {
        case 'debug':
          logger.debug(logMessage, 'Notification');
          break;
        case 'warn':
          logger.warn(logMessage, 'Notification');
          break;
        case 'error':
          logger.error(logMessage, new Error(message), 'Notification');
          break;
        case 'info':
        default:
          logger.info(logMessage, 'Notification');
      }

      // Show toast
      switch (type) {
        case 'success':
          toast.success(message, duration);
          break;
        case 'error':
          toast.error(message, duration);
          break;
        case 'warning':
          toast.warning(message, duration);
          break;
        case 'info':
        default:
          toast.info(message, duration);
      }
    },
    [toast]
  );

  const success = useCallback(
    (message: string, options?: NotificationOptions) => {
      notify(message, 'success', { ...options, logLevel: 'info' });
    },
    [notify]
  );

  const error = useCallback(
    (message: string, options?: NotificationOptions) => {
      notify(message, 'error', { ...options, logLevel: 'error' });
    },
    [notify]
  );

  const info = useCallback(
    (message: string, options?: NotificationOptions) => {
      notify(message, 'info', { ...options, logLevel: 'info' });
    },
    [notify]
  );

  const warning = useCallback(
    (message: string, options?: NotificationOptions) => {
      notify(message, 'warning', { ...options, logLevel: 'warn' });
    },
    [notify]
  );

  return {
    notify,
    success,
    error,
    info,
    warning,
  };
};

/**
 * Create error notification from Error object
 */
export const createErrorNotification = (error: unknown): string => {
  if (error instanceof Error) {
    // Extract meaningful error message
    if (error.message.includes('Network')) {
      return 'Erro de conexão. Verifique sua internet.';
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Sessão expirada. Por favor, inicie sessão novamente.';
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return 'Recurso não encontrado.';
    }
    if (error.message.includes('500') || error.message.includes('server')) {
      return 'Erro do servidor. Tente novamente mais tarde.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Erro desconhecido. Tente novamente.';
};
