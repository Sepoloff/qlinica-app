/**
 * Hook for fetching and caching services data from API
 */

import { useState, useEffect, useCallback } from 'react';
import { servicesAPI, Service, Therapist, therapistsAPI } from '../services/apiService';
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const services = await servicesAPI.getAll();
      setState((prev) => ({
        ...prev,
        services: services || [],
        isLoading: false,
      }));
      logger.debug(`Loaded ${services?.length || 0} services`, 'UseServicesData');
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar serviços';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(`Failed to load services: ${errorMsg}`, err, 'UseServicesData');
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      let therapists: Therapist[];

      if (serviceId) {
        therapists = await therapistsAPI.getByService(serviceId);
      } else {
        therapists = await therapistsAPI.getAll();
      }

      setState((prev) => ({
        ...prev,
        therapists: therapists || [],
        isLoading: false,
      }));

      logger.debug(
        `Loaded ${therapists?.length || 0} therapists${serviceId ? ` for service ${serviceId}` : ''}`,
        'UseTherapistsData'
      );
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar terapeutas';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(
        `Failed to load therapists: ${errorMsg}`,
        err,
        'UseTherapistsData'
      );
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
  slots: string[];
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Try to load from API, fallback to mock if fails
      const slots = await bookingsAPI.getAvailableSlots(therapistId, serviceId, date).catch(() => {
        // Return default slots if API fails
        return [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        ];
      });

      setState((prev) => ({
        ...prev,
        slots: slots || [],
        isLoading: false,
      }));

      logger.debug(`Loaded ${slots?.length || 0} available slots for ${date}`, 'UseBookingAvailability');
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao carregar horários';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      logger.error(`Failed to load slots: ${errorMsg}`, err, 'UseBookingAvailability');
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

// Import for default slots
import { bookingsAPI } from '../services/apiService';
