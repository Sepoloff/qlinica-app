'use strict';

import { api } from '../config/api';
import { SERVICES, THERAPISTS, BOOKINGS } from '../constants/Data';
import { logger } from '../utils/logger';

export interface Service {
  id: number | string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  icon?: string;
  rating?: number;
  reviews_count?: number;
  available?: boolean;
}

export interface Therapist {
  id: number | string;
  name: string;
  specialty: string;
  avatar?: string;
  rating: number;
  reviews_count: number;
  bio?: string;
  available?: boolean;
  phone?: string;
  experience_years?: number;
}

export interface Booking {
  id: string;
  userId?: string;
  serviceId: number | string;
  therapistId: number | string;
  service?: Service;
  therapist?: Therapist;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'completed' | 'confirmed' | 'pending';
  price?: number;
  paid?: boolean;
  location?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CreateBookingPayload {
  serviceId: number | string;
  therapistId: number | string;
  date: string;
  time: string;
  notes?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  available?: boolean;
  duration?: number;
}

class BookingService {
  /**
   * Fetch all bookings for the authenticated user
   */
  async getBookings(filters?: { status?: string; from?: string; to?: string }): Promise<Booking[]> {
    try {
      logger.debug('Fetching user bookings', 'BookingService', { filters });
      const response = await api.get('/bookings', { params: filters });
      
      const bookings = response.data?.data || response.data || [];
      logger.logApiCall('GET', '/bookings', response.status, 0);
      return bookings;
    } catch (error) {
      logger.warn('Failed to fetch bookings from API, using mock data', 'BookingService', error);
      // Return mock data as fallback
      return BOOKINGS as any;
    }
  }

  /**
   * Fetch a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    try {
      logger.debug(`Fetching booking ${id}`, 'BookingService');
      const response = await api.get(`/bookings/${id}`);
      return response.data || null;
    } catch (error) {
      logger.warn(`Failed to fetch booking ${id}`, 'BookingService', error);
      return null;
    }
  }

  /**
   * Get upcoming bookings count
   */
  async getUpcomingBookingsCount(): Promise<number> {
    try {
      const bookings = await this.getBookings({ status: 'upcoming' });
      return bookings.length;
    } catch (error) {
      logger.error('Error getting upcoming bookings count', error as Error, 'BookingService');
      return 0;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    try {
      logger.debug('Creating new booking', 'BookingService', { serviceId: payload.serviceId, therapistId: payload.therapistId });
      
      const response = await api.post('/bookings', {
        service_id: payload.serviceId,
        therapist_id: payload.therapistId,
        date: payload.date,
        time: payload.time,
        notes: payload.notes,
      });
      
      logger.logApiCall('POST', '/bookings', response.status, 0);
      return response.data;
    } catch (error) {
      logger.error('Error creating booking', error as Error, 'BookingService', { payload });
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, payload: Partial<CreateBookingPayload>): Promise<Booking> {
    try {
      logger.debug(`Updating booking ${id}`, 'BookingService');
      const response = await api.put(`/bookings/${id}`, payload);
      return response.data;
    } catch (error) {
      logger.error(`Error updating booking ${id}`, error as Error, 'BookingService');
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      logger.debug(`Cancelling booking ${id}`, 'BookingService', { reason });
      const response = await api.post(`/bookings/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      logger.error(`Error cancelling booking ${id}`, error as Error, 'BookingService');
      throw error;
    }
  }

  /**
   * Fetch available time slots for a therapist on a given date
   */
  async getAvailableSlots(therapistId: number | string, date: string): Promise<AvailableSlot[]> {
    try {
      logger.debug(`Fetching slots for therapist ${therapistId}`, 'BookingService', { date });
      const response = await api.get(`/therapists/${therapistId}/availability`, {
        params: { date },
      });
      
      const slots = response.data?.available_slots || response.data?.slots || [];
      return slots;
    } catch (error) {
      logger.warn(`Failed to fetch slots for therapist ${therapistId}, using defaults`, 'BookingService');
      // Return mock data with realistic slots
      const mockSlots: AvailableSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        mockSlots.push({ date, time, available: true, duration: 60 });
      }
      return mockSlots;
    }
  }

  /**
   * Fetch services
   */
  async getServices(): Promise<Service[]> {
    try {
      logger.debug('Fetching services', 'BookingService');
      const response = await api.get('/services');
      const services = response.data?.data || response.data || SERVICES;
      logger.logApiCall('GET', '/services', response.status, 0);
      return services;
    } catch (error) {
      logger.warn('Failed to fetch services from API, using mock data', 'BookingService');
      return SERVICES;
    }
  }

  /**
   * Fetch therapists (optionally filtered by service)
   */
  async getTherapists(serviceId?: number | string): Promise<Therapist[]> {
    try {
      const params = serviceId ? { service_id: serviceId } : {};
      logger.debug('Fetching therapists', 'BookingService', { serviceId });
      
      const response = await api.get('/therapists', { params });
      const therapists = response.data?.data || response.data || THERAPISTS;
      logger.logApiCall('GET', '/therapists', response.status, 0);
      return therapists;
    } catch (error) {
      logger.warn('Failed to fetch therapists from API, using mock data', 'BookingService');
      return THERAPISTS;
    }
  }

  /**
   * Fetch a single therapist
   */
  async getTherapistById(id: number | string): Promise<Therapist | null> {
    try {
      logger.debug(`Fetching therapist ${id}`, 'BookingService');
      const response = await api.get(`/therapists/${id}`);
      return response.data || null;
    } catch (error) {
      logger.warn(`Failed to fetch therapist ${id}, trying mock data`, 'BookingService');
      const therapist = THERAPISTS.find((t) => t.id === id);
      return therapist || null;
    }
  }

  /**
   * Rate a booking/therapist
   */
  async rateBooking(bookingId: string, rating: number, comment?: string): Promise<void> {
    try {
      logger.debug(`Rating booking ${bookingId}`, 'BookingService', { rating });
      await api.post(`/bookings/${bookingId}/rate`, { rating, comment });
      logger.logApiCall('POST', `/bookings/${bookingId}/rate`, 200, 0);
    } catch (error) {
      logger.error(`Error rating booking ${bookingId}`, error as Error, 'BookingService');
      throw error;
    }
  }

  /**
   * Get booking statistics for user dashboard
   */
  async getBookingStats(): Promise<any> {
    try {
      logger.debug('Fetching booking stats', 'BookingService');
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      logger.warn('Failed to fetch booking stats', 'BookingService');
      // Return default stats
      const bookings = await this.getBookings();
      return {
        totalBookings: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        upcoming: bookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      };
    }
  }

  /**
   * Get bookings filtered by status
   */
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    try {
      return await this.getBookings({ status });
    } catch (error) {
      logger.error(`Error fetching bookings with status ${status}`, error as Error, 'BookingService');
      return [];
    }
  }

  /**
   * Get upcoming user bookings (next 7 days)
   */
  async getUpcomingBookings(): Promise<Booking[]> {
    try {
      const bookings = await this.getBookings({ status: 'upcoming' });
      // Filter bookings from next 7 days
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= now && bookingDate <= nextWeek;
      }).slice(0, 3); // Show top 3
    } catch (error) {
      logger.error('Error fetching upcoming bookings', error as Error, 'BookingService');
      return [];
    }
  }
}

export const bookingService = new BookingService();
