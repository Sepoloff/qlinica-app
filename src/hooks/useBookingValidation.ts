'use strict';

import { useCallback, useState } from 'react';
import {
  validateEmail,
  validateDate,
  validateTimeSlot,
  validateBookingNotes,
} from '../utils/validation';

export interface BookingValidationState {
  service: boolean;
  therapist: boolean;
  date: boolean;
  time: boolean;
  notes: boolean;
}

export interface BookingValidationError {
  service?: string;
  therapist?: string;
  date?: string;
  time?: string;
  notes?: string;
}

/**
 * Hook for validating booking data
 * 
 * Provides comprehensive validation for all booking fields
 * with detailed error messages
 */
export const useBookingValidation = () => {
  const [validationState, setValidationState] = useState<BookingValidationState>({
    service: false,
    therapist: false,
    date: false,
    time: false,
    notes: true, // Optional field
  });

  const [errors, setErrors] = useState<BookingValidationError>({});

  const validateService = useCallback((service: any): boolean => {
    if (!service || !service.id) {
      setErrors((prev) => ({
        ...prev,
        service: 'Por favor, selecione um serviço',
      }));
      setValidationState((prev) => ({ ...prev, service: false }));
      return false;
    }

    setErrors((prev) => ({ ...prev, service: undefined }));
    setValidationState((prev) => ({ ...prev, service: true }));
    return true;
  }, []);

  const validateTherapist = useCallback((therapist: any): boolean => {
    if (!therapist || !therapist.id) {
      setErrors((prev) => ({
        ...prev,
        therapist: 'Por favor, selecione um terapeuta',
      }));
      setValidationState((prev) => ({ ...prev, therapist: false }));
      return false;
    }

    setErrors((prev) => ({ ...prev, therapist: undefined }));
    setValidationState((prev) => ({ ...prev, therapist: true }));
    return true;
  }, []);

  const validateBookingDate = useCallback((date: string): boolean => {
    if (!date) {
      setErrors((prev) => ({
        ...prev,
        date: 'Por favor, selecione uma data',
      }));
      setValidationState((prev) => ({ ...prev, date: false }));
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setErrors((prev) => ({
        ...prev,
        date: 'Formato de data inválido',
      }));
      setValidationState((prev) => ({ ...prev, date: false }));
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setErrors((prev) => ({
        ...prev,
        date: 'Não pode agendar no passado',
      }));
      setValidationState((prev) => ({ ...prev, date: false }));
      return false;
    }

    // Validate date is not more than 90 days in advance
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 90);

    if (selectedDate > maxDate) {
      setErrors((prev) => ({
        ...prev,
        date: 'Não pode agendar mais de 90 dias no futuro',
      }));
      setValidationState((prev) => ({ ...prev, date: false }));
      return false;
    }

    setErrors((prev) => ({ ...prev, date: undefined }));
    setValidationState((prev) => ({ ...prev, date: true }));
    return true;
  }, []);

  const validateTime = useCallback((time: string): boolean => {
    if (!time) {
      setErrors((prev) => ({
        ...prev,
        time: 'Por favor, selecione um horário',
      }));
      setValidationState((prev) => ({ ...prev, time: false }));
      return false;
    }

    // Validate time format (HH:MM)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      setErrors((prev) => ({
        ...prev,
        time: 'Formato de hora inválido',
      }));
      setValidationState((prev) => ({ ...prev, time: false }));
      return false;
    }

    // Check if time is within business hours (9:00-18:00)
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
      setErrors((prev) => ({
        ...prev,
        time: 'Horário fora do funcionamento (9:00-18:00)',
      }));
      setValidationState((prev) => ({ ...prev, time: false }));
      return false;
    }

    setErrors((prev) => ({ ...prev, time: undefined }));
    setValidationState((prev) => ({ ...prev, time: true }));
    return true;
  }, []);

  const validateNotesField = useCallback((notes: string): boolean => {
    if (!notes) {
      setValidationState((prev) => ({ ...prev, notes: true }));
      setErrors((prev) => ({ ...prev, notes: undefined }));
      return true;
    }

    if (!validateBookingNotes(notes)) {
      setErrors((prev) => ({
        ...prev,
        notes: 'Notas não podem ultrapassar 500 caracteres',
      }));
      setValidationState((prev) => ({ ...prev, notes: false }));
      return false;
    }

    setErrors((prev) => ({ ...prev, notes: undefined }));
    setValidationState((prev) => ({ ...prev, notes: true }));
    return true;
  }, []);

  const validateAll = useCallback(
    (booking: {
      service?: any;
      therapist?: any;
      date?: string;
      time?: string;
      notes?: string;
    }): boolean => {
      const isServiceValid = validateService(booking.service);
      const isTherapistValid = validateTherapist(booking.therapist);
      const isDateValid = validateBookingDate(booking.date || '');
      const isTimeValid = validateTime(booking.time || '');
      const isNotesValid = validateNotesField(booking.notes || '');

      return (
        isServiceValid &&
        isTherapistValid &&
        isDateValid &&
        isTimeValid &&
        isNotesValid
      );
    },
    [validateService, validateTherapist, validateBookingDate, validateTime, validateNotesField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setValidationState({
      service: false,
      therapist: false,
      date: false,
      time: false,
      notes: true,
    });
  }, []);

  const isValid = useCallback((): boolean => {
    return (
      validationState.service &&
      validationState.therapist &&
      validationState.date &&
      validationState.time &&
      validationState.notes
    );
  }, [validationState]);

  return {
    validationState,
    errors,
    validateService,
    validateTherapist,
    validateBookingDate,
    validateTime,
    validateNotesField,
    validateAll,
    clearErrors,
    isValid,
  };
};
