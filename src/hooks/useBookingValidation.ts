'use strict';

import { useCallback } from 'react';
import { logger } from '../utils/logger';

export interface BookingValidationErrors {
  service?: string;
  therapist?: string;
  date?: string;
  time?: string;
  general?: string;
}

/**
 * Custom hook for validating booking state at each step
 * 
 * @example
 * const { validateStep, validateComplete, errors } = useBookingValidation();
 * 
 * if (!validateStep(1, bookingState)) {
 *   showError(errors.service);
 * }
 */
export const useBookingValidation = () => {
  const validateService = useCallback((serviceId: any): boolean => {
    if (!serviceId) {
      logger.warn('Service validation failed: no service selected', 'useBookingValidation');
      return false;
    }
    return true;
  }, []);

  const validateTherapist = useCallback((therapistId: any): boolean => {
    if (!therapistId) {
      logger.warn('Therapist validation failed: no therapist selected', 'useBookingValidation');
      return false;
    }
    return true;
  }, []);

  const validateDate = useCallback((date: any): boolean => {
    if (!date) {
      logger.warn('Date validation failed: no date selected', 'useBookingValidation');
      return false;
    }

    // Check if date is in future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      logger.warn('Date validation failed: date is in the past', 'useBookingValidation');
      return false;
    }

    return true;
  }, []);

  const validateTime = useCallback((time: any, date?: string): boolean => {
    if (!time) {
      logger.warn('Time validation failed: no time selected', 'useBookingValidation');
      return false;
    }

    // Check time format HH:MM
    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(time)) {
      logger.warn('Time validation failed: invalid format', 'useBookingValidation');
      return false;
    }

    // If today, ensure time is not in the past
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      
      if (selectedDate.toDateString() === today.toDateString()) {
        const [hours, minutes] = time.split(':');
        const selectedTime = new Date();
        selectedTime.setHours(parseInt(hours), parseInt(minutes));

        if (selectedTime < new Date()) {
          logger.warn('Time validation failed: time is in the past', 'useBookingValidation');
          return false;
        }
      }
    }

    return true;
  }, []);

  const validateStep = useCallback((
    step: 1 | 2 | 3 | 4,
    bookingState: any
  ): boolean => {
    switch (step) {
      case 1:
        return validateService(bookingState.serviceId);
      case 2:
        return validateTherapist(bookingState.therapistId);
      case 3:
        return validateDate(bookingState.date) && validateTime(bookingState.time, bookingState.date);
      case 4:
        return validateComplete(bookingState);
      default:
        return false;
    }
  }, [validateService, validateTherapist, validateDate, validateTime]);

  const validateComplete = useCallback((bookingState: any): boolean => {
    const hasService = validateService(bookingState.serviceId);
    const hasTherapist = validateTherapist(bookingState.therapistId);
    const hasDate = validateDate(bookingState.date);
    const hasTime = validateTime(bookingState.time, bookingState.date);

    return hasService && hasTherapist && hasDate && hasTime;
  }, [validateService, validateTherapist, validateDate, validateTime]);

  const getErrorMessage = useCallback((
    step: 1 | 2 | 3 | 4,
    bookingState: any
  ): string | null => {
    switch (step) {
      case 1:
        if (!bookingState.serviceId) {
          return 'Selecione um serviço para continuar';
        }
        break;
      case 2:
        if (!bookingState.therapistId) {
          return 'Selecione um terapeuta para continuar';
        }
        break;
      case 3:
        if (!bookingState.date) {
          return 'Selecione uma data para continuar';
        }
        if (!bookingState.time) {
          return 'Selecione um horário para continuar';
        }
        if (!validateDate(bookingState.date)) {
          return 'A data selecionada é inválida (passada)';
        }
        if (!validateTime(bookingState.time, bookingState.date)) {
          return 'O horário selecionado é inválido';
        }
        break;
      case 4:
        if (!validateComplete(bookingState)) {
          return 'Dados incompletos. Verifique todos os campos';
        }
        break;
    }
    return null;
  }, [validateDate, validateTime, validateComplete]);

  return {
    validateService,
    validateTherapist,
    validateDate,
    validateTime,
    validateStep,
    validateComplete,
    getErrorMessage,
  };
};

export default useBookingValidation;
