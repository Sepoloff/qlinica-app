'use strict';

import { api } from '../config/api';
import { SERVICES, THERAPISTS, BOOKINGS } from '../constants/Data';

export interface Booking {
  id: string;
  userId: string;
  serviceId: number;
  therapistId: number;
  date: string;
  time: string;
  notes?: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  serviceId: number;
  therapistId: number;
  date: string;
  time: string;
  notes?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
}

class BookingService {
  /**
   * Fetch all bookings for the authenticated user
   */
  async getBookings(filters?: { status?: string; from?: string; to?: string }): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Return mock data as fallback
      return BOOKINGS as any;
    }
  }

  /**
   * Fetch a single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    try {
      const response = await api.post('/bookings', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, payload: Partial<CreateBookingPayload>): Promise<Booking> {
    try {
      const response = await api.put(`/bookings/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch available time slots for a therapist on a given date
   */
  async getAvailableSlots(therapistId: number, date: string): Promise<AvailableSlot[]> {
    try {
      const response = await api.get(`/therapists/${therapistId}/availability`, {
        params: { date },
      });
      return response.data.slots || [];
    } catch (error) {
      console.error(`Error fetching slots for therapist ${therapistId}:`, error);
      // Return mock data
      return [
        { date, time: '09:00' },
        { date, time: '10:00' },
        { date, time: '14:00' },
        { date, time: '15:30' },
      ];
    }
  }

  /**
   * Fetch services
   */
  async getServices() {
    try {
      const response = await api.get('/services');
      return response.data || SERVICES;
    } catch (error) {
      console.error('Error fetching services:', error);
      return SERVICES;
    }
  }

  /**
   * Fetch therapists (optionally filtered by service)
   */
  async getTherapists(serviceId?: number) {
    try {
      const params = serviceId ? { serviceId } : {};
      const response = await api.get('/therapists', { params });
      return response.data || THERAPISTS;
    } catch (error) {
      console.error('Error fetching therapists:', error);
      return THERAPISTS;
    }
  }

  /**
   * Fetch a single therapist
   */
  async getTherapistById(id: number) {
    try {
      const response = await api.get(`/therapists/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching therapist ${id}:`, error);
      const therapist = THERAPISTS.find((t) => t.id === id);
      return therapist || null;
    }
  }

  /**
   * Rate a booking/therapist
   */
  async rateBooking(bookingId: string, rating: number, comment?: string): Promise<void> {
    try {
      await api.post(`/bookings/${bookingId}/rate`, { rating, comment });
    } catch (error) {
      console.error(`Error rating booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get booking statistics for user dashboard
   */
  async getBookingStats() {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return { totalBookings: 0, completed: 0, upcoming: 0 };
    }
  }
}

export const bookingService = new BookingService();
