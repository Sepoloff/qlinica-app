'use strict';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { bookingService } from '../services/bookingService';

export interface BookingFlowState {
  serviceId?: number;
  therapistId?: number;
  date?: string;
  time?: string;
  notes?: string;
}

interface BookingFlowContextType {
  bookingState: BookingFlowState;
  setBookingState: (state: Partial<BookingFlowState>) => void;
  resetBookingState: () => void;
  submitBooking: () => Promise<any>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export const BookingFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingState, setBookingStateInternal] = useState<BookingFlowState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBookingState = (state: Partial<BookingFlowState>) => {
    setBookingStateInternal((prev) => ({ ...prev, ...state }));
  };

  const resetBookingState = () => {
    setBookingStateInternal({});
    setError(null);
  };

  const submitBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!bookingState.serviceId || !bookingState.therapistId || !bookingState.date || !bookingState.time) {
        throw new Error('Missing required booking information');
      }

      const result = await bookingService.createBooking({
        serviceId: bookingState.serviceId,
        therapistId: bookingState.therapistId,
        date: bookingState.date,
        time: bookingState.time,
        notes: bookingState.notes,
      });

      resetBookingState();
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <BookingFlowContext.Provider
      value={{
        bookingState,
        setBookingState,
        resetBookingState,
        submitBooking,
        isSubmitting,
        error,
        clearError,
      }}
    >
      {children}
    </BookingFlowContext.Provider>
  );
};

export const useBookingFlow = () => {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within BookingFlowProvider');
  }
  return context;
};
