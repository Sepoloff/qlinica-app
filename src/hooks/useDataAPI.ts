/**
 * Custom hooks for fetching data from API
 */

import { useState, useEffect, useCallback } from 'react';
import { servicesAPI, Service, therapistsAPI, Therapist } from '../services/apiService';
import { logger } from '../utils/logger';

// ============================================================================
// useServices Hook
// ============================================================================

interface UseServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

export const useServices = () => {
  const [state, setState] = useState<UseServicesState>({
    services: [],
    isLoading: true,
    error: null,
  });

  const fetchServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const services = await servicesAPI.getAll();
      setState(prev => ({
        ...prev,
        services,
        isLoading: false,
        error: null,
      }));
      logger.debug(`✅ Loaded ${services.length} services`, 'Hook:Services');
      return services;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load services';
      logger.error('Failed to fetch services', err);
      setState(prev => ({
        ...prev,
        services: [],
        isLoading: false,
        error: errorMsg,
      }));
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getService = useCallback(
    (id: string): Service | undefined => {
      return state.services.find(s => s.id === id);
    },
    [state.services]
  );

  return {
    services: state.services,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchServices,
    getService,
  };
};

// ============================================================================
// useTherapists Hook
// ============================================================================

interface UseTherapistsState {
  therapists: Therapist[];
  isLoading: boolean;
  error: string | null;
  filters: {
    specialty?: string;
    minRating?: number;
  };
}

export const useTherapists = () => {
  const [state, setState] = useState<UseTherapistsState>({
    therapists: [],
    isLoading: true,
    error: null,
    filters: {},
  });

  const fetchTherapists = useCallback(async (specialty?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let therapists: Therapist[] = [];

      if (specialty) {
        therapists = await therapistsAPI.getBySpecialty(specialty);
      } else {
        therapists = await therapistsAPI.getAll();
      }

      setState(prev => ({
        ...prev,
        therapists,
        isLoading: false,
        error: null,
        filters: { specialty },
      }));
      logger.debug(`✅ Loaded ${therapists.length} therapists`, 'Hook:Therapists');
      return therapists;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load therapists';
      logger.error('Failed to fetch therapists', err);
      setState(prev => ({
        ...prev,
        therapists: [],
        isLoading: false,
        error: errorMsg,
      }));
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const getTherapist = useCallback(
    (id: string): Therapist | undefined => {
      return state.therapists.find(t => t.id === id);
    },
    [state.therapists]
  );

  const filterByRating = useCallback(
    (minRating: number): Therapist[] => {
      return state.therapists.filter(t => t.rating >= minRating);
    },
    [state.therapists]
  );

  const searchByName = useCallback(
    (query: string): Therapist[] => {
      const lowerQuery = query.toLowerCase();
      return state.therapists.filter(
        t =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.specialty.toLowerCase().includes(lowerQuery)
      );
    },
    [state.therapists]
  );

  return {
    therapists: state.therapists,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchTherapists,
    getTherapist,
    filterByRating,
    searchByName,
  };
};

// ============================================================================
// useTherapistAvailability Hook
// ============================================================================

interface UseAvailabilityState {
  availability: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

export const useTherapistAvailability = (therapistId: string) => {
  const [state, setState] = useState<UseAvailabilityState>({
    availability: {},
    isLoading: true,
    error: null,
  });

  const fetchAvailability = useCallback(async (startDate: string, endDate: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const availability = await therapistsAPI.getAvailability(
        therapistId,
        startDate,
        endDate
      );
      setState(prev => ({
        ...prev,
        availability,
        isLoading: false,
        error: null,
      }));
      logger.debug(
        `✅ Loaded availability for therapist ${therapistId}`,
        'Hook:Availability'
      );
      return availability;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load availability';
      logger.error(
        `Failed to fetch availability for therapist ${therapistId}`,
        err,
        'Hook:Availability'
      );
      setState(prev => ({
        ...prev,
        availability: {},
        isLoading: false,
        error: errorMsg,
      }));
      throw err;
    }
  }, [therapistId]);

  const getAvailableSlots = useCallback(
    (date: string): string[] => {
      return state.availability[date] || [];
    },
    [state.availability]
  );

  const isSlotAvailable = useCallback(
    (date: string, time: string): boolean => {
      const slots = getAvailableSlots(date);
      return slots.includes(time);
    },
    [getAvailableSlots]
  );

  return {
    availability: state.availability,
    isLoading: state.isLoading,
    error: state.error,
    fetchAvailability,
    getAvailableSlots,
    isSlotAvailable,
  };
};
