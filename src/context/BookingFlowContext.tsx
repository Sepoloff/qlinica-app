'use strict';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { bookingsAPI, Booking } from '../services/apiService';
import { logger } from '../utils/logger';

export interface BookingFlowState {
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  therapistId?: string;
  therapistName?: string;
  date?: string;
  time?: string;
  notes?: string;
  createdBooking?: Booking;
}

interface BookingFlowContextType {
  bookingState: BookingFlowState;
  setBookingState: (state: Partial<BookingFlowState>) => void;
  resetBookingState: () => void;
  submitBooking: () => Promise<Booking>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
  validateBookingData: () => { valid: boolean; errors: string[] };
  getBookingSummary: () => string;
}

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export const BookingFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingState, setBookingStateInternal] = useState<BookingFlowState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBookingState = useCallback((state: Partial<BookingFlowState>) => {
    setBookingStateInternal((prev) => ({ ...prev, ...state }));
  }, []);

  const resetBookingState = useCallback(() => {
    setBookingStateInternal({});
    setError(null);
  }, []);

  // Validate booking data before submission
  const validateBookingData = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!bookingState.serviceId) {
      errors.push('Serviço é obrigatório');
    }
    if (!bookingState.therapistId) {
      errors.push('Terapeuta é obrigatório');
    }
    if (!bookingState.date) {
      errors.push('Data é obrigatória');
    }
    if (!bookingState.time) {
      errors.push('Horário é obrigatório');
    }

    // Validate date format (YYYY-MM-DD or DD/MM/YYYY)
    if (bookingState.date) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(bookingState.date)) {
        errors.push('Formato de data inválido');
      }

      // Validate date is not in the past
      const bookingDate = new Date(bookingState.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        errors.push('A data não pode estar no passado');
      }
    }

    // Validate time format (HH:MM)
    if (bookingState.time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(bookingState.time)) {
        errors.push('Formato de horário inválido (use HH:MM)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [bookingState]);

  // Get booking summary for display
  const getBookingSummary = useCallback((): string => {
    const parts: string[] = [];
    
    if (bookingState.serviceName) parts.push(`📋 ${bookingState.serviceName}`);
    if (bookingState.therapistName) parts.push(`👨‍⚕️ ${bookingState.therapistName}`);
    if (bookingState.date) parts.push(`📅 ${bookingState.date}`);
    if (bookingState.time) parts.push(`⏰ ${bookingState.time}`);
    
    return parts.join(' • ');
  }, [bookingState]);

  // Submit booking via API
  const submitBooking = useCallback(async (): Promise<Booking> => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate data
      const validation = validateBookingData();
      if (!validation.valid) {
        const errorMessage = validation.errors.join('; ');
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Ensure all required fields are present
      if (!bookingState.serviceId || !bookingState.therapistId || !bookingState.date || !bookingState.time) {
        throw new Error('Informações de agendamento incompletas');
      }

      // Create booking via API
      const bookingData = {
        serviceId: bookingState.serviceId,
        therapistId: bookingState.therapistId,
        date: bookingState.date,
        time: bookingState.time,
        notes: bookingState.notes || '',
      };

      logger.debug(`Creating booking: ${JSON.stringify(bookingData)}`, 'BookingFlowContext');
      const booking = await bookingsAPI.create(bookingData);

      // Store created booking in state
      setBookingStateInternal((prev) => ({
        ...prev,
        createdBooking: booking,
      }));

      logger.debug(`✅ Booking created successfully: ${booking.id}`, 'BookingFlowContext');
      
      // Keep booking data but reset after a delay so UI can show summary
      // (caller should explicitly call resetBookingState when done)
      
      return booking;
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        'Falha ao criar agendamento. Tente novamente.';
      
      setError(errorMessage);
      logger.error(`Failed to create booking: ${errorMessage}`, err, 'BookingFlowContext');
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [bookingState, validateBookingData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: BookingFlowContextType = {
    bookingState,
    setBookingState,
    resetBookingState,
    submitBooking,
    isSubmitting,
    error,
    clearError,
    validateBookingData,
    getBookingSummary,
  };

  return (
    <BookingFlowContext.Provider value={value}>
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
