'use strict';

import { useState, useCallback } from 'react';
import { api } from '../config/api';
import { logger } from '../utils/logger';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  duration: number; // in minutes
  category: string;
  isActive: boolean;
  requiresTherapist: boolean;
  maxBookingsPerDay?: number;
}

interface UseServicesAPIState {
  services: Service[];
  selectedService: Service | null;
  isLoading: boolean;
  error: string | null;
}

export const useServicesAPI = () => {
  const [state, setState] = useState<UseServicesAPIState>({
    services: [],
    selectedService: null,
    isLoading: false,
    error: null,
  });

  const fetchServices = useCallback(async (filters?: { category?: string }) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }

      const response = await api.get(
        `/services${params.toString() ? '?' + params.toString() : ''}`
      );
      const services = response.data.data || response.data;

      setState((prev) => ({
        ...prev,
        services,
        isLoading: false,
      }));

      logger.debug(`Fetched ${services.length} services`, 'useServicesAPI');
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      logger.error('Error fetching services', error as Error, 'useServicesAPI');
      throw error;
    }
  }, []);

  const getServiceById = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/services/${id}`);
      const service = response.data;

      setState((prev) => ({
        ...prev,
        selectedService: service,
      }));

      logger.debug(`Fetched service: ${id}`, 'useServicesAPI');
      return service;
    } catch (error) {
      logger.error(`Error fetching service ${id}`, error as Error, 'useServicesAPI');
      throw error;
    }
  }, []);

  const getServicesByCategory = useCallback(async (category: string) => {
    try {
      return await fetchServices({ category });
    } catch (error) {
      logger.error(`Error fetching services for category ${category}`, error as Error, 'useServicesAPI');
      throw error;
    }
  }, [fetchServices]);

  const searchServices = useCallback(async (query: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get(`/services/search?q=${encodeURIComponent(query)}`);
      const services = response.data;

      setState((prev) => ({
        ...prev,
        services,
        isLoading: false,
      }));

      logger.debug(`Search found ${services.length} services`, 'useServicesAPI');
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      logger.error('Search error', error as Error, 'useServicesAPI');
      throw error;
    }
  }, []);

  const sortByPrice = useCallback((ascending = true) => {
    setState((prev) => ({
      ...prev,
      services: [...prev.services].sort((a, b) =>
        ascending ? a.price - b.price : b.price - a.price
      ),
    }));
  }, []);

  const sortByDuration = useCallback((ascending = true) => {
    setState((prev) => ({
      ...prev,
      services: [...prev.services].sort((a, b) =>
        ascending ? a.duration - b.duration : b.duration - a.duration
      ),
    }));
  }, []);

  const filterByCategory = useCallback((category: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.category === category),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const selectService = useCallback((service: Service) => {
    setState((prev) => ({ ...prev, selectedService: service }));
  }, []);

  const getCategories = useCallback(() => {
    const categories = new Set(state.services.map((s) => s.category));
    return Array.from(categories);
  }, [state.services]);

  return {
    // State
    services: state.services,
    selectedService: state.selectedService,
    isLoading: state.isLoading,
    error: state.error,

    // Methods
    fetchServices,
    getServiceById,
    getServicesByCategory,
    searchServices,
    sortByPrice,
    sortByDuration,
    filterByCategory,
    selectService,
    getCategories,
    clearError,
  };
};
