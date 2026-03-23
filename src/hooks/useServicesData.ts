/**
 * Hook for fetching and caching services data from API
 */

import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI, servicesAPI, Service, Therapist, therapistsAPI } from '../services/apiService';
import { bookingService } from '../services/bookingService';
import { logger } from '../utils/logger';

interface UseServicesDataState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch services from API with caching
 */
export const useServicesData = () => {
  const [state, setState] = useState<UseServicesDataState>({
    services: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const services = await servicesAPI.getAll();
      setState(prev => ({
        ...prev,
        services: services || [],
        isLoading: false,
      }));
      logger.debug(`Loaded ${services?.length || 0} services`);
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar serviços';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(`Failed to load services: ${errorMsg}`, err);
    }
  }, []);

  const getServiceById = useCallback(
    (id: string): Service | undefined => {
      return state.services.find((s) => s.id === id);
    },
    [state.services]
  );

  const refresh = useCallback(() => {
    loadServices();
  }, [loadServices]);

  return {
    ...state,
    getServiceById,
    refresh,
  };
};

interface UseTherapistsDataState {
  therapists: Therapist[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch therapists from API with optional filtering
 */
export const useTherapistsData = (serviceId?: string) => {
  const [state, setState] = useState<UseTherapistsDataState>({
    therapists: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadTherapists();
  }, [serviceId]);

  const loadTherapists = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Get all therapists (API filtering by service comes from booking context)
      const therapists = await therapistsAPI.getAll();

      setState(prev => ({
        ...prev,
        therapists: therapists || [],
        isLoading: false,
      }));

      logger.debug(
        `Loaded ${therapists?.length || 0} therapists${serviceId ? ` for service ${serviceId}` : ''}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar terapeutas';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(
        `Failed to load therapists: ${errorMsg}`,
        err);
    }
  }, [serviceId]);

  const getTherapistById = useCallback(
    (id: string): Therapist | undefined => {
      return state.therapists.find((t) => t.id === id);
    },
    [state.therapists]
  );

  const getTherapistsByRating = useCallback(
    (minRating: number = 4): Therapist[] => {
      return state.therapists.filter((t) => t.rating >= minRating).sort((a, b) => b.rating - a.rating);
    },
    [state.therapists]
  );

  const refresh = useCallback(() => {
    loadTherapists();
  }, [loadTherapists]);

  return {
    ...state,
    getTherapistById,
    getTherapistsByRating,
    refresh,
  };
};

interface UseBookingAvailabilityState {
  slots: Array<{
    date: string;
    time: string;
    available?: boolean;
    duration?: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch available booking slots
 */
export const useBookingAvailability = (therapistId: string, serviceId: string, date: string) => {
  const [state, setState] = useState<UseBookingAvailabilityState>({
    slots: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (therapistId && serviceId && date) {
      loadAvailableSlots();
    }
  }, [therapistId, serviceId, date]);

  const loadAvailableSlots = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Try to load from API, fallback to mock if fails
      // Note: bookingService.getAvailableSlots takes therapistId and date
      const slotsResponse = await bookingService.getAvailableSlots(therapistId, date).catch(() => {
        // Return default slots if API fails
        return [
          { date, time: '09:00', available: true, duration: 60 },
          { date, time: '09:30', available: true, duration: 60 },
          { date, time: '10:00', available: true, duration: 60 },
          { date, time: '10:30', available: true, duration: 60 },
          { date, time: '11:00', available: true, duration: 60 },
          { date, time: '11:30', available: true, duration: 60 },
          { date, time: '14:00', available: true, duration: 60 },
          { date, time: '14:30', available: true, duration: 60 },
          { date, time: '15:00', available: true, duration: 60 },
          { date, time: '15:30', available: true, duration: 60 },
          { date, time: '16:00', available: true, duration: 60 },
          { date, time: '16:30', available: true, duration: 60 },
        ];
      });

      setState(prev => ({
        ...prev,
        slots: slotsResponse || [],
        isLoading: false,
      }));

      logger.debug(`Loaded ${slotsResponse?.length || 0} available slots for ${date}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar horários';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(`Failed to load slots: ${errorMsg}`, err);
    }
  }, [therapistId, serviceId, date]);

  const refresh = useCallback(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  return {
    ...state,
    refresh,
  };
};


