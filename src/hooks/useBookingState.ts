'use strict';

import { useCallback, useState } from 'react';
import { useBookingFlow } from '../context/BookingFlowContext';
import { useToast } from '../context/ToastContext';
import { logger } from '../utils/logger';

interface BookingStateHelper {
  updateService: (serviceId: string, serviceName: string, price?: number) => void;
  updateTherapist: (therapistId: string, therapistName: string) => void;
  updateDateTime: (date: string, time: string) => void;
  updateNotes: (notes: string) => void;
  getBookingState: () => any;
  validateBooking: () => { valid: boolean; errors: string[] };
  reset: () => void;
}

/**
 * Hook to manage booking state and validation
 * Consolidates booking flow state with validation
 */
export const useBookingState = (): BookingStateHelper => {
  const { bookingState, setBookingState, validateBookingData, resetBookingState } = useBookingFlow();
  const { showToast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);

  const updateService = useCallback((serviceId: string, serviceName: string, price?: number) => {
    try {
      logger.debug(`Updating booking service: ${serviceId} - ${serviceName}`);
      setBookingState({
        serviceId,
        serviceName,
        ...(price && { servicePrice: price }),
      });
      setLastError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar serviço';
      logger.error('Error updating service', error);
      setLastError(msg);
      showToast(msg, 'error');
    }
  }, [setBookingState, showToast]);

  const updateTherapist = useCallback((therapistId: string, therapistName: string) => {
    try {
      logger.debug(`Updating booking therapist: ${therapistId} - ${therapistName}`);
      setBookingState({
        therapistId,
        therapistName,
      });
      setLastError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar terapeuta';
      logger.error('Error updating therapist', error);
      setLastError(msg);
      showToast(msg, 'error');
    }
  }, [setBookingState, showToast]);

  const updateDateTime = useCallback((date: string, time: string) => {
    try {
      logger.debug(`Updating booking date/time: ${date} ${time}`);
      setBookingState({ date, time });
      setLastError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar data/hora';
      logger.error('Error updating date/time', error);
      setLastError(msg);
      showToast(msg, 'error');
    }
  }, [setBookingState, showToast]);

  const updateNotes = useCallback((notes: string) => {
    try {
      logger.debug('Updating booking notes');
      setBookingState({ notes });
      setLastError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar notas';
      logger.error('Error updating notes', error);
      setLastError(msg);
      showToast(msg, 'error');
    }
  }, [setBookingState, showToast]);

  const validateBooking = useCallback((): { valid: boolean; errors: string[] } => {
    try {
      const validation = validateBookingData();
      if (!validation.valid) {
        const errorMsg = validation.errors.join('\n');
        setLastError(errorMsg);
        showToast(errorMsg, 'error');
      }
      return validation;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao validar agendamento';
      logger.error('Error validating booking', error);
      setLastError(msg);
      showToast(msg, 'error');
      return { valid: false, errors: [msg] };
    }
  }, [validateBookingData, showToast]);

  const getBookingState = useCallback(() => {
    return { ...bookingState };
  }, [bookingState]);

  const reset = useCallback(() => {
    logger.debug('Resetting booking state');
    resetBookingState();
    setLastError(null);
  }, [resetBookingState]);

  return {
    updateService,
    updateTherapist,
    updateDateTime,
    updateNotes,
    getBookingState,
    validateBooking,
    reset,
  };
};
