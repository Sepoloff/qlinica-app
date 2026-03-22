/**
 * Hook for managing the complete booking flow
 * Handles service selection, therapist selection, date/time selection, and confirmation
 */

import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useMutation } from './useFetch';
import bookingService from '../services/bookingService';

export interface BookingFlowState {
  currentStep: 'service' | 'therapist' | 'datetime' | 'summary' | 'complete';
  isLoading: boolean;
  error: string | null;
  bookingId: string | null;
}

export interface UseBookingFlowReturn {
  state: BookingFlowState;
  selectService: (serviceId: string) => Promise<void>;
  selectTherapist: (therapistId: string) => Promise<void>;
  selectDateTime: (date: string, time: string) => Promise<void>;
  confirmBooking: () => Promise<string | null>;
  goToStep: (step: BookingFlowState['currentStep']) => void;
  resetFlow: () => void;
  canGoNext: () => boolean;
  canGoBack: () => boolean;
}

export const useBookingFlow = (isReschedule: boolean = false): UseBookingFlowReturn => {
  const { user } = useAuth();
  const { bookingData, setService, setTherapist, setDateTime, resetBooking } = useBooking();
  const { mutate } = useMutation();

  const [state, setState] = useState<BookingFlowState>({
    currentStep: 'service',
    isLoading: false,
    error: null,
    bookingId: null,
  });

  const selectService = useCallback(async (serviceId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = await bookingService.getService(serviceId);
      setService({
        id: parseInt(serviceId),
        name: service.name,
        icon: '✨',
        desc: service.description,
        duration: service.duration.toString(),
        price: service.price.toString(),
      });

      setState(prev => ({ ...prev, currentStep: 'therapist', isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to select service';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
    }
  }, [setService]);

  const selectTherapist = useCallback(async (therapistId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const therapist = await bookingService.getTherapist(therapistId);
      setTherapist({
        id: parseInt(therapistId),
        name: therapist.name,
        specialty: therapist.specialty,
        rating: therapist.rating,
        reviews: therapist.reviews,
        available: therapist.available,
        avatar: therapist.avatar,
      });

      setState(prev => ({ ...prev, currentStep: 'datetime', isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to select therapist';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
    }
  }, [setTherapist]);

  const selectDateTime = useCallback(async (date: string, time: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      setDateTime(date, time);
      setState(prev => ({ ...prev, currentStep: 'summary', isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to select date/time';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
    }
  }, [setDateTime]);

  const confirmBooking = useCallback(async (): Promise<string | null> => {
    if (!user || !bookingData.service || !bookingData.therapist || !bookingData.date || !bookingData.time) {
      setState(prev => ({ ...prev, error: 'Booking data is incomplete' }));
      return null;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let result;
      
      if (isReschedule && bookingData.originalBookingId) {
        // Reschedule existing booking
        result = await mutate(() =>
          bookingService.rescheduleBooking(
            bookingData.originalBookingId!,
            bookingData.date,
            bookingData.time
          )
        );
      } else {
        // Create new booking
        result = await mutate(() =>
          bookingService.createBooking({
            serviceId: bookingData.service!.id.toString(),
            therapistId: bookingData.therapist!.id.toString(),
            date: bookingData.date,
            time: bookingData.time,
          })
        );
      }

      if (result) {
        setState(prev => ({
          ...prev,
          currentStep: 'complete',
          isLoading: false,
          bookingId: result.id,
        }));
        resetBooking();
        return result.id;
      } else {
        throw new Error('Failed to confirm booking');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm booking';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return null;
    }
  }, [user, bookingData, isReschedule, mutate, resetBooking]);

  const goToStep = useCallback((step: BookingFlowState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'service',
      isLoading: false,
      error: null,
      bookingId: null,
    });
    resetBooking();
  }, [resetBooking]);

  const canGoNext = useCallback((): boolean => {
    switch (state.currentStep) {
      case 'service':
        return !!bookingData.service;
      case 'therapist':
        return !!bookingData.therapist;
      case 'datetime':
        return !!bookingData.date && !!bookingData.time;
      case 'summary':
        return true;
      default:
        return false;
    }
  }, [state.currentStep, bookingData]);

  const canGoBack = useCallback((): boolean => {
    return state.currentStep !== 'service' && state.currentStep !== 'complete';
  }, [state.currentStep]);

  return {
    state,
    selectService,
    selectTherapist,
    selectDateTime,
    confirmBooking,
    goToStep,
    resetFlow,
    canGoNext,
    canGoBack,
  };
};
