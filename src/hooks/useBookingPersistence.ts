'use strict';

import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookingFlow } from '../context/BookingFlowContext';
import { logger } from '../utils/logger';

export interface BookingPersistenceOptions {
  key?: string;
  autoSave?: boolean;
  autoRestore?: boolean;
}

/**
 * Custom hook for persisting booking state to AsyncStorage
 * 
 * Automatically saves booking state after changes and restores on mount.
 * Useful for handling app interruptions and providing continuity.
 * 
 * @example
 * const { hasPreviousBooking, restorePreviousBooking, clearPersisted } = useBookingPersistence();
 * 
 * // On component mount
 * useEffect(() => {
 *   if (hasPreviousBooking) {
 *     showAlert('Continuar agendamento anterior?', {
 *       onRestore: restorePreviousBooking,
 *       onClear: clearPersisted,
 *     });
 *   }
 * }, []);
 */
export const useBookingPersistence = (options: BookingPersistenceOptions = {}) => {
  const {
    key = 'booking_in_progress',
    autoSave = true,
    autoRestore = true,
  } = options;

  const { bookingState, setBookingState, resetBookingState } = useBookingFlow();

  // Save booking state to AsyncStorage
  const persistBooking = useCallback(async () => {
    try {
      if (!bookingState.serviceId && !bookingState.therapistId && !bookingState.date) {
        // No meaningful state to persist
        return;
      }

      await AsyncStorage.setItem(key, JSON.stringify(bookingState));
      logger.debug(`Booking persisted: ${key}`, 'useBookingPersistence');
    } catch (error) {
      logger.error('Error persisting booking', error);
    }
  }, [bookingState, key]);

  // Restore booking state from AsyncStorage
  const restorePersistedBooking = useCallback(async () => {
    try {
      const persisted = await AsyncStorage.getItem(key);
      if (persisted) {
        const previousState = JSON.parse(persisted);
        setBookingState(previousState);
        logger.debug(`Booking restored from persistence: ${key}`, 'useBookingPersistence');
        return previousState;
      }
    } catch (error) {
      logger.error('Error restoring booking', error);
    }
    return null;
  }, [key, setBookingState]);

  // Clear persisted booking
  const clearPersistedBooking = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      resetBookingState();
      logger.debug(`Booking cleared from persistence: ${key}`, 'useBookingPersistence');
    } catch (error) {
      logger.error('Error clearing booking persistence', error);
    }
  }, [key, resetBookingState]);

  // Check if there's a previous booking in storage
  const hasPreviousBooking = useCallback(async (): Promise<boolean> => {
    try {
      const persisted = await AsyncStorage.getItem(key);
      return !!persisted;
    } catch (error) {
      logger.error('Error checking booking persistence', error);
      return false;
    }
  }, [key]);

  // Auto-save on state change
  useEffect(() => {
    if (autoSave) {
      persistBooking();
    }
  }, [bookingState, autoSave, persistBooking]);

  // Auto-restore on mount
  useEffect(() => {
    if (autoRestore) {
      restorePersistedBooking();
    }
  }, [autoRestore, restorePersistedBooking]);

  return {
    bookingState,
    persistBooking,
    restorePersistedBooking,
    clearPersistedBooking,
    hasPreviousBooking,
  };
};

export default useBookingPersistence;
