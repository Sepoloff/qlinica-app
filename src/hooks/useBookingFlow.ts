/**
 * Custom hook for managing complete booking flow
 * Integrates with API, validation, and state management
 */

import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookingFlow } from '../context/BookingFlowContext';
import { useToast } from '../context/ToastContext';
import { bookingsAPI, Booking } from '../services/apiService';
import { logger } from '../utils/logger';

interface BookingFlowHookState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

export const useBookingFlowHook = () => {
  const { user } = useAuth();
  const { bookingState, submitBooking, validateBookingData, resetBookingState } = useBookingFlow();
  const { showToast } = useToast();
  const [state, setState] = useState<BookingFlowHookState>({
    isLoading: false,
    isSubmitting: false,
    error: null,
    successMessage: null,
  });

  /**
   * Navigate through booking flow - validates state and submits when complete
   */
  const proceedWithBooking = useCallback(async (): Promise<Booking | null> => {
    try {
      // Check authentication
      if (!user) {
        setState((prev) => ({ ...prev, error: 'Você precisa estar autenticado' }));
        showToast('Autenticação necessária', 'error');
        return null;
      }

      // Validate booking data
      const validation = validateBookingData();
      if (!validation.valid) {
        const errorMsg = validation.errors.join('; ');
        setState((prev) => ({ ...prev, error: errorMsg }));
        showToast(errorMsg, 'error');
        logger.warn(`Booking validation failed: ${errorMsg}`);
        return null;
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      // Submit booking
      const booking = await submitBooking();

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        successMessage: 'Agendamento confirmado com sucesso!',
        error: null,
      }));

      showToast('Agendamento realizado com sucesso! ✅', 'success');
      logger.debug(`Booking submitted successfully: ${booking.id}`);

      return booking;
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Falha ao processar agendamento. Tente novamente.';

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));

      showToast(errorMessage, 'error');
      logger.error(`Booking flow failed: ${errorMessage}`, err);

      return null;
    }
  }, [user, validateBookingData, submitBooking, showToast]);

  /**
   * Clear errors
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear success message
   */
  const clearSuccessMessage = useCallback(() => {
    setState((prev) => ({ ...prev, successMessage: null }));
  }, []);

  /**
   * Get human-readable booking summary
   */
  const getBookingSummaryText = useCallback((): string => {
    const parts: string[] = [];

    if (bookingState.serviceName) parts.push(`📋 ${bookingState.serviceName}`);
    if (bookingState.servicePrice) parts.push(`💰 €${bookingState.servicePrice}`);
    if (bookingState.therapistName) parts.push(`👨‍⚕️ ${bookingState.therapistName}`);
    if (bookingState.date) parts.push(`📅 ${bookingState.date}`);
    if (bookingState.time) parts.push(`⏰ ${bookingState.time}`);

    return parts.join('\n');
  }, [bookingState]);

  /**
   * Check if booking is ready to submit
   */
  const isBookingComplete = useCallback((): boolean => {
    return !!(
      bookingState.serviceId &&
      bookingState.therapistId &&
      bookingState.date &&
      bookingState.time
    );
  }, [bookingState]);

  /**
   * Get progress percentage (0-100)
   */
  const getProgressPercentage = useCallback((): number => {
    let completed = 0;
    const total = 4; // service, therapist, date, time

    if (bookingState.serviceId) completed++;
    if (bookingState.therapistId) completed++;
    if (bookingState.date) completed++;
    if (bookingState.time) completed++;

    return Math.round((completed / total) * 100);
  }, [bookingState]);

  return {
    ...state,
    bookingState,
    isBookingComplete: isBookingComplete(),
    progressPercentage: getProgressPercentage(),
    proceedWithBooking,
    clearError,
    clearSuccessMessage,
    getBookingSummaryText,
    resetBookingState,
  };
};
