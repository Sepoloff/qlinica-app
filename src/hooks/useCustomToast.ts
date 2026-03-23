'use strict';

/**
 * useCustomToast Hook
 * Provides improved toast notifications with auto-dismiss and custom styling
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useToast } from '../context/ToastContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface UseCustomToastReturn {
  show: (message: string, type?: ToastType, options?: ToastOptions) => void;
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string | Error, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

export const useCustomToast = (): UseCustomToastReturn => {
  const { show: showToast } = useToast();

  const show = useCallback(
    (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
      const { duration = 3000, position = 'bottom' } = options;

      const icons: Record<ToastType, string> = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
      };

      const formattedMessage = `${icons[type]} ${message}`;

      showToast({
        message: formattedMessage,
        type,
        duration,
        position: position as any,
      });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, options?: ToastOptions) => {
      show(message, 'success', { duration: 2000, ...options });
    },
    [show]
  );

  const showError = useCallback(
    (message: string | Error, options?: ToastOptions) => {
      const errorMessage = message instanceof Error ? message.message : message;
      show(errorMessage, 'error', { duration: 4000, ...options });
    },
    [show]
  );

  const showInfo = useCallback(
    (message: string, options?: ToastOptions) => {
      show(message, 'info', { duration: 2500, ...options });
    },
    [show]
  );

  const showWarning = useCallback(
    (message: string, options?: ToastOptions) => {
      show(message, 'warning', { duration: 3500, ...options });
    },
    [show]
  );

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      Alert.alert('Confirmação', message, [
        {
          text: 'Cancelar',
          onPress: () => onCancel?.(),
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => onConfirm(),
          style: 'default',
        },
      ]);
    },
    []
  );

  return {
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
  };
};
