import { useContext } from 'react';
import { ToastContext, Toast, ToastContextType } from '../context/ToastContext';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Convenience hook for quick toast notifications
export const useQuickToast = () => {
  const { show } = useToast();

  return {
    success: (message: string) => show({ message, type: 'success', duration: 3000 }),
    error: (message: string) => show({ message, type: 'error', duration: 4000 }),
    info: (message: string) => show({ message, type: 'info', duration: 3000 }),
    warning: (message: string) => show({ message, type: 'warning', duration: 3000 }),
  };
};
