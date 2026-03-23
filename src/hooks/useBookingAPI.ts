/**
 * Custom hook for managing bookings via API
 */

import { useState, useCallback } from 'react';
import { bookingsAPI, Booking } from '../services/apiService';
import { logger } from '../utils/logger';
import { useToast } from './useToast';

interface UseBookingAPIState {
  isLoading: boolean;
  error: string | null;
  bookings: Booking[];
  currentBooking: Booking | null;
}

export const useBookingAPI = () => {
  const toast = useToast();
  const [state, setState] = useState<UseBookingAPIState>({
    isLoading: false,
    error: null,
    bookings: [],
    currentBooking: null,
  });

  /**
   * Fetch all bookings
   */
  const fetchBookings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const bookings = await bookingsAPI.getAll();
      setState(prev => ({ ...prev, bookings, isLoading: false }));
      return bookings;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load bookings';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
      logger.error('Failed to fetch bookings', err);
      throw err;
    }
  }, [toast]);

  /**
   * Fetch single booking
   */
  const fetchBooking = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const booking = await bookingsAPI.getById(id);
      if (!booking) throw new Error('Booking not found');
      setState(prev => ({ ...prev, currentBooking: booking, isLoading: false }));
      return booking;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load booking';
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
      toast.error(errorMsg);
      logger.error(`Failed to fetch booking ${id}`, err, 'Hook:BookingAPI');
      throw err;
    }
  }, [toast]);

  /**
   * Create new booking
   */
  const createBooking = useCallback(
    async (data: {
      serviceId: string;
      therapistId: string;
      date: string;
      time: string;
      notes?: string;
    }) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const booking = await bookingsAPI.create(data);
        setState(prev => ({
          ...prev,
          currentBooking: booking,
          bookings: [booking, ...prev.bookings],
          isLoading: false,
        }));
        toast.success('Booking created successfully!');
        logger.debug(`Booking created: ${booking.id}`, 'Hook:BookingAPI');
        return booking;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to create booking';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        toast.error(errorMsg);
        logger.error('Failed to create booking', err);
        throw err;
      }
    },
    [toast]
  );

  /**
   * Update booking
   */
  const updateBooking = useCallback(
    async (id: string, data: Partial<Booking>) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const booking = await bookingsAPI.update(id, data);
        setState(prev => ({
          ...prev,
          currentBooking: booking,
          bookings: prev.bookings.map(b => (b.id === id ? booking : b)),
          isLoading: false,
        }));
        toast.success('Booking updated successfully!');
        logger.debug(`Booking updated: ${id}`, 'Hook:BookingAPI');
        return booking;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update booking';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        toast.error(errorMsg);
        logger.error(`Failed to update booking ${id}`, err, 'Hook:BookingAPI');
        throw err;
      }
    },
    [toast]
  );

  /**
   * Cancel booking
   */
  const cancelBooking = useCallback(
    async (id: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        await bookingsAPI.cancel(id);
        setState(prev => ({
          ...prev,
          bookings: prev.bookings.filter(b => b.id !== id),
          currentBooking: prev.currentBooking?.id === id ? null : prev.currentBooking,
          isLoading: false,
        }));
        toast.success('Booking cancelled successfully!');
        logger.debug(`Booking cancelled: ${id}`, 'Hook:BookingAPI');
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to cancel booking';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        toast.error(errorMsg);
        logger.error(`Failed to cancel booking ${id}`, err, 'Hook:BookingAPI');
        throw err;
      }
    },
    [toast]
  );

  /**
   * Reschedule booking
   */
  const rescheduleBooking = useCallback(
    async (id: string, date: string, time: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const booking = await bookingsAPI.reschedule(id, date, time);
        setState(prev => ({
          ...prev,
          currentBooking: booking,
          bookings: prev.bookings.map(b => (b.id === id ? booking : b)),
          isLoading: false,
        }));
        toast.success('Booking rescheduled successfully!');
        logger.debug(`Booking rescheduled: ${id}`, 'Hook:BookingAPI');
        return booking;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to reschedule booking';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        toast.error(errorMsg);
        logger.error(`Failed to reschedule booking ${id}`, err, 'Hook:BookingAPI');
        throw err;
      }
    },
    [toast]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchBookings,
    fetchBooking,
    createBooking,
    updateBooking,
    cancelBooking,
    rescheduleBooking,
    clearError,
  };
};
