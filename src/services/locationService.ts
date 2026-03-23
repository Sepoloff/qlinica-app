/**
 * Location Service
 * Handles geolocation requests for clinic location and user location
 */

import * as Location from 'expo-location';
import { logger } from '../utils/logger';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: string;
  message: string;
}

class LocationService {
  private hasPermission = false;

  /**
   * Request location permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      if (this.hasPermission) {
        logger.debug('Location permission granted', 'LocationService');
      } else {
        logger.warn('Location permission denied', 'LocationService');
      }
      
      return this.hasPermission;
    } catch (error) {
      logger.error('Error requesting location permission', error);
      return false;
    }
  }

  /**
   * Get current user location
   */
  async getUserLocation(): Promise<LocationCoords | null> {
    try {
      if (!this.hasPermission) {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          logger.warn('Location permission required but not granted', 'LocationService');
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      logger.debug(`User location obtained: ${coords.latitude}, ${coords.longitude}`, 'LocationService');
      return coords;
    } catch (error) {
      logger.error('Error getting user location', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (in km)
   * Uses Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2));
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Reverse geocoding - get address from coordinates
   */
  async getAddressFromCoords(latitude: number, longitude: number): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const fullAddress = [address.street, address.city, address.postalCode]
          .filter(Boolean)
          .join(', ');

        logger.debug(`Address resolved: ${fullAddress}`, 'LocationService');
        return fullAddress;
      }

      return null;
    } catch (error) {
      logger.error('Error reverse geocoding', error);
      return null;
    }
  }

  /**
   * Geocoding - get coordinates from address
   */
  async getCoordsFromAddress(address: string): Promise<LocationCoords | null> {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations.length > 0) {
        const coords = {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
          accuracy: locations[0].altitude || undefined,
        };

        logger.debug(`Coordinates resolved for "${address}": ${coords.latitude}, ${coords.longitude}`, 'LocationService');
        return coords;
      }

      return null;
    } catch (error) {
      logger.error('Error geocoding address', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
