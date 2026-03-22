import { bookingService, CreateBookingPayload, Booking } from '../../services/bookingService';
import { api } from '../../config/api';
import { BOOKINGS } from '../../constants/Data';

// Mock axios
jest.mock('../../config/api');

describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookings', () => {
    it('should fetch all bookings', async () => {
      const mockBookings = BOOKINGS as any;
      (api.get as jest.Mock).mockResolvedValue({ data: mockBookings });

      const result = await bookingService.getBookings();

      expect(api.get).toHaveBeenCalledWith('/bookings', { params: undefined });
      expect(result).toEqual(mockBookings);
    });

    it('should apply filters when provided', async () => {
      const filters = { status: 'confirmed', from: '2024-03-22' };
      const mockBookings = [];
      (api.get as jest.Mock).mockResolvedValue({ data: mockBookings });

      await bookingService.getBookings(filters);

      expect(api.get).toHaveBeenCalledWith('/bookings', { params: filters });
    });

    it('should fallback to mock data on error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await bookingService.getBookings();

      expect(result).toEqual(BOOKINGS);
    });

    it('should handle empty response', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await bookingService.getBookings();

      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('should fetch a booking by ID', async () => {
      const mockBooking = BOOKINGS[0];
      (api.get as jest.Mock).mockResolvedValue({ data: mockBooking });

      const result = await bookingService.getBookingById('1');

      expect(api.get).toHaveBeenCalledWith('/bookings/1');
      expect(result).toEqual(mockBooking);
    });

    it('should return null on error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await bookingService.getBookingById('999');

      expect(result).toBeNull();
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const payload: CreateBookingPayload = {
        serviceId: 1,
        therapistId: 1,
        date: '2024-03-30',
        time: '14:00',
        notes: 'First time patient',
      };

      const mockResponse = {
        id: '123',
        userId: 'user1',
        ...payload,
        status: 'confirmed',
        createdAt: '2024-03-22T10:00:00Z',
        updatedAt: '2024-03-22T10:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await bookingService.createBooking(payload);

      expect(api.post).toHaveBeenCalledWith('/bookings', payload);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      const payload = {
        serviceId: 1,
        therapistId: 1,
        date: '2024-03-30',
        time: '14:00',
      };

      const error = new Error('API Error');
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(bookingService.createBooking(payload)).rejects.toThrow('API Error');
    });

    it('should handle validation errors from API', async () => {
      const payload = {
        serviceId: 1,
        therapistId: 1,
        date: '2024-03-30',
        time: '14:00',
      };

      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid date or time',
            errors: { time: 'Slot not available' },
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(validationError);

      await expect(bookingService.createBooking(payload)).rejects.toEqual(validationError);
    });
  });

  describe('updateBooking', () => {
    it('should update an existing booking', async () => {
      const bookingId = '1';
      const updatePayload = { time: '15:00' };
      const mockUpdated = { ...BOOKINGS[0], time: '15:00' };

      (api.put as jest.Mock).mockResolvedValue({ data: mockUpdated });

      const result = await bookingService.updateBooking(bookingId, updatePayload);

      expect(api.put).toHaveBeenCalledWith(`/bookings/${bookingId}`, updatePayload);
      expect(result.time).toBe('15:00');
    });

    it('should throw error if booking not found', async () => {
      (api.put as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: 'Booking not found' } },
      });

      await expect(bookingService.updateBooking('999', {})).rejects.toEqual(
        expect.objectContaining({
          response: expect.objectContaining({ status: 404 }),
        })
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      const bookingId = '1';
      const mockCancelled = { ...BOOKINGS[0], status: 'cancelled' };

      (api.post as jest.Mock).mockResolvedValue({ data: mockCancelled });

      const result = await bookingService.cancelBooking(bookingId);

      expect(api.post).toHaveBeenCalledWith(`/bookings/${bookingId}/cancel`, { reason: undefined });
      expect(result.status).toBe('cancelled');
    });

    it('should include cancellation reason', async () => {
      const bookingId = '1';
      const reason = 'Schedule conflict';
      const mockCancelled = { ...BOOKINGS[0], status: 'cancelled' };

      (api.post as jest.Mock).mockResolvedValue({ data: mockCancelled });

      await bookingService.cancelBooking(bookingId, reason);

      expect(api.post).toHaveBeenCalledWith(`/bookings/${bookingId}/cancel`, { reason });
    });

    it('should throw error if booking cannot be cancelled', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: 'Booking already completed' } },
      });

      await expect(bookingService.cancelBooking('1')).rejects.toEqual(
        expect.objectContaining({
          response: expect.objectContaining({ status: 400 }),
        })
      );
    });
  });

  describe('getAvailableSlots', () => {
    it('should fetch available slots for a therapist', async () => {
      const therapistId = '1';
      const date = '2024-03-30';
      const mockSlots = [
        { date, time: '09:00' },
        { date, time: '10:00' },
        { date, time: '14:00' },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockSlots });

      const result = await bookingService.getAvailableSlots(therapistId, date);

      expect(api.get).toHaveBeenCalledWith(`/therapists/${therapistId}/availability`, {
        params: { date },
      });
      expect(result).toEqual(mockSlots);
    });

    it('should return empty array if no slots available', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await bookingService.getAvailableSlots('1', '2024-03-30');

      expect(result).toEqual([]);
    });
  });

  describe('getUserBookings', () => {
    it('should fetch current user bookings', async () => {
      const mockUserBookings = [BOOKINGS[0]];
      (api.get as jest.Mock).mockResolvedValue({ data: mockUserBookings });

      const result = await bookingService.getUserBookings();

      expect(api.get).toHaveBeenCalledWith('/bookings/me');
      expect(result).toEqual(mockUserBookings);
    });

    it('should fallback to mock data on error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      const result = await bookingService.getUserBookings();

      expect(result).toEqual(BOOKINGS);
    });
  });

  describe('getServices', () => {
    it('should fetch all available services', async () => {
      const mockServices = [
        {
          id: 1,
          name: 'Psicoterapia',
          duration: 60,
          price: 80,
          description: 'Terapia psicológica individual',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await bookingService.getServices();

      expect(api.get).toHaveBeenCalledWith('/services');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Psicoterapia');
    });

    it('should handle service fetch errors gracefully', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const result = await bookingService.getServices();

      // Should fallback to default services or empty array
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTherapists', () => {
    it('should fetch all therapists', async () => {
      const mockTherapists = [
        {
          id: 1,
          name: 'Dr. João',
          specialty: 'Psicologia',
          rating: 4.8,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockTherapists });

      const result = await bookingService.getTherapists();

      expect(api.get).toHaveBeenCalledWith('/therapists');
      expect(result).toHaveLength(1);
    });

    it('should support service filtering', async () => {
      const mockTherapists = [];
      (api.get as jest.Mock).mockResolvedValue({ data: mockTherapists });

      await bookingService.getTherapists(1);

      expect(api.get).toHaveBeenCalledWith('/therapists', { params: { serviceId: 1 } });
    });
  });
});
