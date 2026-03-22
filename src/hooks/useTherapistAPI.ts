'use strict';

import { useState, useCallback, useEffect } from 'react';
import { api } from '../config/api';
import { logger } from '../utils/logger';

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  languages: string[];
  certifications: string[];
  availability?: {
    [date: string]: string[]; // date -> available time slots
  };
}

export interface TherapistFilter {
  specialty?: string;
  minRating?: number;
  language?: string;
  date?: string;
}

interface UseTherapistAPIState {
  therapists: Therapist[];
  selectedTherapist: Therapist | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export const useTherapistAPI = () => {
  const [state, setState] = useState<UseTherapistAPIState>({
    therapists: [],
    selectedTherapist: null,
    isLoading: false,
    error: null,
    totalCount: 0,
  });

  const fetchTherapists = useCallback(
    async (filters?: TherapistFilter, page = 1, limit = 10) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const params = new URLSearchParams();
        if (filters?.specialty) params.append('specialty', filters.specialty);
        if (filters?.minRating) params.append('minRating', String(filters.minRating));
        if (filters?.language) params.append('language', filters.language);
        if (filters?.date) params.append('date', filters.date);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const response = await api.get(`/therapists?${params.toString()}`);
        const { data, total } = response.data;

        setState((prev) => ({
          ...prev,
          therapists: data,
          totalCount: total,
          isLoading: false,
        }));

        logger.debug(`Fetched ${data.length} therapists`, 'useTherapistAPI');
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch therapists';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        logger.error('Error fetching therapists', error as Error, 'useTherapistAPI');
        throw error;
      }
    },
    []
  );

  const getTherapistById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get(`/therapists/${id}`);
      const therapist = response.data;

      setState((prev) => ({
        ...prev,
        selectedTherapist: therapist,
        isLoading: false,
      }));

      logger.debug(`Fetched therapist: ${id}`, 'useTherapistAPI');
      return therapist;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch therapist';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      logger.error(`Error fetching therapist ${id}`, error as Error, 'useTherapistAPI');
      throw error;
    }
  }, []);

  const getAvailability = useCallback(
    async (therapistId: string, serviceId: string, date: string) => {
      try {
        const response = await api.get(
          `/therapists/${therapistId}/availability?serviceId=${serviceId}&date=${date}`
        );
        const { availableSlots } = response.data;

        logger.debug(
          `Fetched ${availableSlots.length} slots for therapist ${therapistId} on ${date}`,
          'useTherapistAPI'
        );

        return availableSlots;
      } catch (error) {
        logger.error('Error fetching availability', error as Error, 'useTherapistAPI');
        throw error;
      }
    },
    []
  );

  const searchTherapists = useCallback(
    async (query: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.get(`/therapists/search?q=${encodeURIComponent(query)}`);
        const therapists = response.data;

        setState((prev) => ({
          ...prev,
          therapists,
          isLoading: false,
        }));

        logger.debug(`Search found ${therapists.length} therapists`, 'useTherapistAPI');
        return therapists;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        logger.error('Search error', error as Error, 'useTherapistAPI');
        throw error;
      }
    },
    []
  );

  const sortByRating = useCallback(() => {
    setState((prev) => ({
      ...prev,
      therapists: [...prev.therapists].sort((a, b) => b.rating - a.rating),
    }));
  }, []);

  const sortByExperience = useCallback(() => {
    setState((prev) => ({
      ...prev,
      therapists: [...prev.therapists].sort((a, b) => b.yearsExperience - a.yearsExperience),
    }));
  }, []);

  const filterBySpecialty = useCallback((specialty: string) => {
    setState((prev) => ({
      ...prev,
      therapists: prev.therapists.filter((t) => t.specialty === specialty),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const selectTherapist = useCallback((therapist: Therapist) => {
    setState((prev) => ({ ...prev, selectedTherapist: therapist }));
  }, []);

  return {
    // State
    therapists: state.therapists,
    selectedTherapist: state.selectedTherapist,
    isLoading: state.isLoading,
    error: state.error,
    totalCount: state.totalCount,

    // Methods
    fetchTherapists,
    getTherapistById,
    getAvailability,
    searchTherapists,
    sortByRating,
    sortByExperience,
    filterBySpecialty,
    selectTherapist,
    clearError,
  };
};
