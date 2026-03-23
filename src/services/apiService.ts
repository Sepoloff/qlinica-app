/**
 * API Service - Encapsulates all API calls with error handling and type safety
 */

import { api } from '../config/api';
import { logger } from '../utils/logger';
import { User } from '../context/AuthContext';

// ============================================================================
// Types
// ============================================================================

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
}

export interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  bio?: string;
  availability: {
    [date: string]: string[]; // date -> array of available times
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      logger.debug(`✅ Login successful for ${email}`);
      return response.data;
    } catch (error: any) {
      logger.error('Login failed', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Register new user
   */
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        email,
        password,
        name,
      });
      logger.debug(`✅ Registration successful for ${email}`);
      return response.data;
    } catch (error: any) {
      logger.error('Registration failed', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      logger.debug('✅ Logout successful');
    } catch (error: any) {
      logger.error('Logout failed', error);
      // Don't throw - always clear local auth
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch profile', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<User>('/auth/me', data);
      logger.debug('✅ Profile updated');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to update profile', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      logger.debug('✅ Password changed');
    } catch (error: any) {
      logger.error('Failed to change password', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
      logger.debug(`✅ Password reset requested for ${email}`);
    } catch (error: any) {
      logger.error('Failed to request password reset', error);
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      logger.debug('✅ Password reset successful');
    } catch (error: any) {
      logger.error('Failed to reset password', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
};

// ============================================================================
// Services API
// ============================================================================

export const servicesAPI = {
  /**
   * Get all available services
   */
  getAll: async (): Promise<Service[]> => {
    try {
      const response = await api.get<Service[]>('/services');
      const services = Array.isArray(response.data) ? response.data : [];
      logger.debug(`✅ Fetched ${services.length} services`);
      return services;
    } catch (error: any) {
      logger.error('Failed to fetch services', error);
      return []; // Return empty array as fallback
    }
  },

  /**
   * Get service by ID
   */
  getById: async (id: string): Promise<Service | null> => {
    try {
      const response = await api.get<Service>(`/services/${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch service ${id}`, error);
      return null;
    }
  },
};

// ============================================================================
// Therapists API
// ============================================================================

export const therapistsAPI = {
  /**
   * Get all therapists
   */
  getAll: async (): Promise<Therapist[]> => {
    try {
      const response = await api.get<Therapist[]>('/therapists');
      const therapists = Array.isArray(response.data) ? response.data : [];
      logger.debug(`✅ Fetched ${therapists.length} therapists`);
      return therapists;
    } catch (error: any) {
      logger.error('Failed to fetch therapists', error);
      return []; // Return empty array as fallback
    }
  },

  /**
   * Get therapist by ID
   */
  getById: async (id: string): Promise<Therapist | null> => {
    try {
      const response = await api.get<Therapist>(`/therapists/${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch therapist ${id}`, error);
      return null;
    }
  },

  /**
   * Get therapists by specialty
   */
  getBySpecialty: async (specialty: string): Promise<Therapist[]> => {
    try {
      const response = await api.get<Therapist[]>(`/therapists?specialty=${specialty}`);
      const therapists = Array.isArray(response.data) ? response.data : [];
      return therapists;
    } catch (error: any) {
      logger.error(`Failed to fetch therapists for specialty ${specialty}`, error);
      return [];
    }
  },

  /**
   * Get therapist availability
   */
  getAvailability: async (
    therapistId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, string[]>> => {
    try {
      const response = await api.get<Record<string, string[]>>(
        `/therapists/${therapistId}/availability`,
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch availability for therapist ${therapistId}`, error);
      return {};
    }
  },
};

// ============================================================================
// Bookings API
// ============================================================================

export const bookingsAPI = {
  /**
   * Get all bookings for current user
   */
  getAll: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<Booking[]>('/bookings');
      const bookings = Array.isArray(response.data) ? response.data : [];
      logger.debug(`✅ Fetched ${bookings.length} bookings`);
      return bookings;
    } catch (error: any) {
      logger.error('Failed to fetch bookings', error);
      return [];
    }
  },

  /**
   * Get booking by ID
   */
  getById: async (id: string): Promise<Booking | null> => {
    try {
      const response = await api.get<Booking>(`/bookings/${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch booking ${id}`, error);
      return null;
    }
  },

  /**
   * Create new booking
   */
  create: async (bookingData: {
    serviceId: string;
    therapistId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Booking> => {
    try {
      const response = await api.post<Booking>('/bookings', bookingData);
      logger.debug(`✅ Booking created: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to create booking', error);
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  /**
   * Update booking
   */
  update: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    try {
      const response = await api.put<Booking>(`/bookings/${id}`, data);
      logger.debug(`✅ Booking updated: ${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to update booking ${id}`, error);
      throw new Error(error.response?.data?.message || 'Failed to update booking');
    }
  },

  /**
   * Cancel booking
   */
  cancel: async (id: string): Promise<void> => {
    try {
      await api.post(`/bookings/${id}/cancel`);
      logger.debug(`✅ Booking cancelled: ${id}`);
    } catch (error: any) {
      logger.error(`Failed to cancel booking ${id}`, error);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  /**
   * Reschedule booking
   */
  reschedule: async (id: string, date: string, time: string): Promise<Booking> => {
    try {
      const response = await api.post<Booking>(`/bookings/${id}/reschedule`, { date, time });
      logger.debug(`✅ Booking rescheduled: ${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to reschedule booking ${id}`, error);
      throw new Error(error.response?.data?.message || 'Failed to reschedule booking');
    }
  },
};

// ============================================================================
// Health Check
// ============================================================================

export const healthAPI = {
  /**
   * Check API health
   */
  check: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};

export default {
  auth: authAPI,
  services: servicesAPI,
  therapists: therapistsAPI,
  bookings: bookingsAPI,
  health: healthAPI,
};
