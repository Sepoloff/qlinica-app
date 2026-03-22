import { useContext } from 'react';
import { ToastContext, ToastContextType } from '../context/ToastContext';

/**
 * Hook to use toast notifications
 * Usage: const toast = useQuickToast();
 *        toast.success('Success message');
 *        toast.error('Error message');
 *        toast.info('Info');
 *        toast.warning('Warning');
 */
export const useQuickToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useQuickToast must be used within ToastProvider');
  }
  return context;
};

// Alias for compatibility
export const useToast = useQuickToast;
