/**
 * useLocation Hook
 * Manages location requests and updates
 */

import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationCoords } from '../services/locationService';
import { logger } from '../utils/logger';

interface UseLocationReturn {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationCoords | null>;
  calculateDistance: (lat2: number, lon2: number) => number | null;
  getAddress: (latitude: number, longitude: number) => Promise<string | null>;
  clearError: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request user location
   */
  const requestLocation = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const userLocation = await locationService.getUserLocation();

      if (userLocation) {
        setLocation(userLocation);
        logger.debug('User location updated', 'useLocation');
        return userLocation;
      } else {
        setError('Could not retrieve location. Please check permissions.');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get location';
      setError(errorMessage);
      logger.error('Error in useLocation', err, 'useLocation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calculate distance from current location to destination
   */
  const calculateDistance = useCallback(
    (lat2: number, lon2: number): number | null => {
      if (!location) {
        setError('Location not available');
        return null;
      }

      try {
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          lat2,
          lon2
        );
        return distance;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to calculate distance';
        setError(errorMessage);
        logger.error('Error calculating distance', err, 'useLocation');
        return null;
      }
    },
    [location]
  );

  /**
   * Get address from coordinates
   */
  const getAddress = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      try {
        setError(null);
        const address = await locationService.getAddressFromCoords(latitude, longitude);
        return address;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to get address';
        setError(errorMessage);
        logger.error('Error getting address', err, 'useLocation');
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation,
    calculateDistance,
    getAddress,
    clearError,
  };
};
