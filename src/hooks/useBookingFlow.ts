'use strict';

import { useCallback, useState } from 'react';
import { validateBookingDate, validateTimeSlot, validateBookingNotes } from '../utils/validation';

export interface BookingFlowState {
  serviceId?: string | number;
  therapistId?: string | number;
  date?: string;
  time?: string;
  notes?: string;
  errors: Record<string, string>;
}

/**
 * Hook for managing booking flow state and validation
 */
export const useBookingFlowValidation = () => {
  const [state, setState] = useState<BookingFlowState>({
    errors: {},
  });

  const setServiceId = useCallback((serviceId: string | number) => {
    setState(prev => ({
      ...prev,
      serviceId,
      errors: { ...prev.errors, serviceId: '' },
    }));
  }, []);

  const setTherapistId = useCallback((therapistId: string | number) => {
    setState(prev => ({
      ...prev,
      therapistId,
      errors: { ...prev.errors, therapistId: '' },
    }));
  }, []);

  const setDateTime = useCallback((date: string, time: string) => {
    const errors: Record<string, string> = {};

    // Validate date
    const dateObj = new Date(date);
    const dateValidation = validateBookingDate(dateObj);
    if (!dateValidation.valid) {
      errors.date = dateValidation.error || 'Invalid date';
    }

    // Validate time
    if (!validateTimeSlot(time)) {
      errors.time = 'Invalid time slot (must be between 09:00 and 18:00)';
    }

    setState(prev => ({
      ...prev,
      date,
      time,
      errors: { ...prev.errors, ...errors },
    }));

    return Object.keys(errors).length === 0;
  }, []);

  const setNotes = useCallback((notes: string) => {
    const isValid = validateBookingNotes(notes);
    setState(prev => ({
      ...prev,
      notes,
      errors: {
        ...prev.errors,
        notes: isValid ? '' : 'Notes cannot exceed 500 characters',
      },
    }));
  }, []);

  const validateBooking = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!state.serviceId) {
      errors.serviceId = 'Service selection is required';
    }

    if (!state.therapistId) {
      errors.therapistId = 'Therapist selection is required';
    }

    if (!state.date) {
      errors.date = 'Date selection is required';
    } else {
      const dateObj = new Date(state.date);
      const dateValidation = validateBookingDate(dateObj);
      if (!dateValidation.valid) {
        errors.date = dateValidation.error || 'Invalid date';
      }
    }

    if (!state.time) {
      errors.time = 'Time selection is required';
    } else if (!validateTimeSlot(state.time)) {
      errors.time = 'Invalid time slot';
    }

    if (state.notes && !validateBookingNotes(state.notes)) {
      errors.notes = 'Notes are too long';
    }

    setState(prev => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  }, [state]);

  const reset = useCallback(() => {
    setState({ errors: {} });
  }, []);

  return {
    state,
    setServiceId,
    setTherapistId,
    setDateTime,
    setNotes,
    validateBooking,
    reset,
    isComplete:
      !!state.serviceId &&
      !!state.therapistId &&
      !!state.date &&
      !!state.time &&
      Object.keys(state.errors).length === 0,
  };
};
