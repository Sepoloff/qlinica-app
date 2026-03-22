import { api } from '../config/api';
import { handleAPIError, logAPIError } from './errorHandler';

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
  duration: number; // in minutes
  price: number;
  icon: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  available: boolean;
  avatar: string;
  phone: string;
  email: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  therapistId: string;
}

class BookingService {
  // Get all available services
  async getServices(): Promise<Service[]> {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error: any) {
      const apiError = handleAPIError(error);
      logAPIError(apiError, 'BookingService.getServices');
      throw apiError;
    }
  }

  // Get service by ID
  async getService(serviceId: string): Promise<Service> {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  // Get all therapists
  async getTherapists(): Promise<Therapist[]> {
    try {
      const response = await api.get('/therapists');
      return response.data;
    } catch (error) {
      console.error('Error fetching therapists:', error);
      throw error;
    }
  }

  // Get therapists by service
  async getTherapistsByService(serviceId: string): Promise<Therapist[]> {
    try {
      const response = await api.get(`/therapists?serviceId=${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching therapists by service:', error);
      throw error;
    }
  }

  // Get single therapist
  async getTherapist(therapistId: string): Promise<Therapist> {
    try {
      const response = await api.get(`/therapists/${therapistId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching therapist:', error);
      throw error;
    }
  }

  // Get available time slots
  async getAvailableSlots(
    therapistId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> {
    try {
      const response = await api.get(`/availability/slots`, {
        params: {
          therapistId,
          serviceId,
          date,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  // Create booking
  async createBooking(bookingData: {
    serviceId: string;
    therapistId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Booking> {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get user bookings
  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(bookingId: string, data: Partial<Booking>): Promise<Booking> {
    try {
      const response = await api.put(`/bookings/${bookingId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      await api.post(`/bookings/${bookingId}/cancel`, { reason });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Reschedule booking
  async rescheduleBooking(
    bookingId: string,
    newDate: string,
    newTime: string
  ): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${bookingId}/reschedule`, {
        date: newDate,
        time: newTime,
      });
      return response.data;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw error;
    }
  }

  // Check availability for multiple dates
  async checkMultipleDatesAvailability(
    therapistId: string,
    dates: string[]
  ): Promise<Record<string, boolean>> {
    try {
      const response = await api.post('/availability/check-dates', {
        therapistId,
        dates,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking dates availability:', error);
      throw error;
    }
  }
}

export default new BookingService();
