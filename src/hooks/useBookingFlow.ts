'use strict';

import { useCallback } from 'react';
import { useBookingFlow } from '../context/BookingFlowContext';

/**
 * Hook to manage the booking flow state and submission
 * Provides easy access to booking state and common actions
 */
export const useBookingFlowHook = () => {
  const { bookingState, setBookingState, resetBookingState, submitBooking, isSubmitting, error, clearError } =
    useBookingFlow();

  const selectService = useCallback(
    (serviceId: number) => {
      setBookingState({ serviceId });
    },
    [setBookingState]
  );

  const selectTherapist = useCallback(
    (therapistId: number) => {
      setBookingState({ therapistId });
    },
    [setBookingState]
  );

  const selectDateTime = useCallback(
    (date: string, time: string) => {
      setBookingState({ date, time });
    },
    [setBookingState]
  );

  const addNotes = useCallback(
    (notes: string) => {
      setBookingState({ notes });
    },
    [setBookingState]
  );

  const isComplete = useCallback(() => {
    return !!(bookingState.serviceId && bookingState.therapistId && bookingState.date && bookingState.time);
  }, [bookingState]);

  return {
    bookingState,
    selectService,
    selectTherapist,
    selectDateTime,
    addNotes,
    resetBooking: resetBookingState,
    submitBooking,
    isSubmitting,
    error,
    clearError,
    isComplete: isComplete(),
  };
};

export default useBookingFlowHook;
