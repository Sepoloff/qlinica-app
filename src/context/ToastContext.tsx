'use strict';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ message, type = 'info', duration = 3000 }: Omit<Toast, 'id'>) => {
      const id = Date.now().toString() + Math.random();
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      show({ message, type, duration });
    },
    [show]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, duration: number = 3000) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration: number = 4000) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration: number = 3000) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration: number = 3500) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      show, 
      showToast, 
      removeToast, 
      clearAll,
      success,
      error,
      info,
      warning
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
