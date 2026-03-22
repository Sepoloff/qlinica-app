/**
 * usePayment Hook
 * Manages payment operations with cleanup and state tracking
 */

import { useState, useCallback, useEffect } from 'react';
import { paymentService, PaymentResult, PaymentMethod } from '../services/paymentService';
import { useToast } from '../context/ToastContext';

interface UsePaymentOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  autoInitialize?: boolean;
}

export const usePayment = (options: UsePaymentOptions = {}) => {
  const { onSuccess, onError, autoInitialize = true } = options;
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize payment service
  useEffect(() => {
    if (!autoInitialize) return;

    const initializePayment = async () => {
      try {
        if (!paymentService.isReady()) {
          await paymentService.initialize();
        }
        setIsReady(true);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    };

    initializePayment();
  }, [autoInitialize, showToast]);

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedMethodId(methods[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load payment methods';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Create payment intent
  const createPaymentIntent = useCallback(
    async (options: {
      amount: number;
      currency: string;
      bookingId: string;
      description?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const intent = await paymentService.createPaymentIntent(options);
        return intent;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create payment intent';
        setError(errorMsg);
        onError?.(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onError]
  );

  // Process payment
  const processPayment = useCallback(
    async (options: {
      clientSecret: string;
      paymentMethodId: string;
      amount: number;
      currency: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await paymentService.confirmPayment(options);
        if (result.success) {
          onSuccess?.(result);
          showToast('Pagamento realizado com sucesso!', 'success');
        } else {
          const errorMsg = result.error || 'Payment failed';
          setError(errorMsg);
          onError?.(errorMsg);
          showToast(errorMsg, 'error');
        }
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
        setError(errorMsg);
        onError?.(errorMsg);
        showToast(errorMsg, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, showToast]
  );

  // Save payment method
  const savePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const method = await paymentService.savePaymentMethod(paymentMethodId);
        setPaymentMethods((prev) => [...prev, method]);
        setSelectedMethodId(method.id);
        showToast('Método de pagamento guardado com sucesso', 'success');
        return method;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to save payment method';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Delete payment method
  const deletePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const success = await paymentService.deletePaymentMethod(paymentMethodId);
        if (success) {
          setPaymentMethods((prev) => prev.filter((m) => m.id !== paymentMethodId));
          if (selectedMethodId === paymentMethodId) {
            setSelectedMethodId(paymentMethods.length > 1 ? paymentMethods[0].id : null);
          }
          showToast('Método de pagamento removido', 'success');
        }
        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete payment method';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedMethodId, paymentMethods, showToast]
  );

  // Get payment history
  const getPaymentHistory = useCallback(
    async (options?: { limit?: number; offset?: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const history = await paymentService.getPaymentHistory(options);
        return history;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load payment history';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Calculate totals
  const calculateTotal = useCallback(
    (subtotal: number, taxRate?: number) => {
      return paymentService.calculateTotal(subtotal, taxRate);
    },
    []
  );

  // Format price
  const formatPrice = useCallback(
    (amount: number, currency?: string) => {
      return paymentService.formatPrice(amount, currency);
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get selected payment method
  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  return {
    // State
    isLoading,
    error,
    isReady,
    paymentMethods,
    selectedMethodId,
    selectedMethod,

    // Methods
    loadPaymentMethods,
    createPaymentIntent,
    processPayment,
    savePaymentMethod,
    deletePaymentMethod,
    getPaymentHistory,
    calculateTotal,
    formatPrice,
    clearError,
    setSelectedMethodId,
  };
};
