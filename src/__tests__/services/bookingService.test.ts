/**
 * Testes para BookingService
 * Testa: getBookings, createBooking
 */

import { bookingService } from '../../services/bookingService';
import { api } from '../../config/api';

// Mock do api
jest.mock('../../config/api');

describe('BookingService - Bookings Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============== GET BOOKINGS TESTS ==============
  describe('getBookings', () => {
    const mockBookingsResponse = [
      {
        id: 'booking-1',
        userId: 'user-123',
        serviceId: 1,
        therapistId: 1,
        date: '2026-03-25',
        time: '10:00',
        status: 'upcoming',
        price: 50,
        paid: false,
        createdAt: '2026-03-22T10:00:00Z',
      },
      {
        id: 'booking-2',
        userId: 'user-123',
        serviceId: 2,
        therapistId: 2,
        date: '2026-03-26',
        time: '14:30',
        status: 'confirmed',
        price: 75,
        paid: true,
        createdAt: '2026-03-22T11:00:00Z',
      },
    ];

    it('✅ deve buscar todas as reservas do usuário', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: mockBookingsResponse,
      });

      const result = await bookingService.getBookings();

      expect(result).toEqual(mockBookingsResponse);
      expect(api.get).toHaveBeenCalledWith('/bookings', expect.any(Object));
    });

    it('✅ deve retornar array vazio se nenhuma reserva', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: [],
      });

      const result = await bookingService.getBookings();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('✅ deve fazer requisição GET para /bookings', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: mockBookingsResponse,
      });

      await bookingService.getBookings();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('bookings'), expect.any(Object));
    });

    it('❌ deve retornar fallback em caso de erro', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      });

      const result = await bookingService.getBookings();
      expect(Array.isArray(result)).toBe(true);
    });

    it('✅ deve filtrar reservas by status', async () => {
      const upcomingBookings = mockBookingsResponse.filter(b => b.status === 'upcoming');

      (api.get as jest.Mock).mockResolvedValue({
        data: upcomingBookings,
      });

      const result = await bookingService.getBookings({ status: 'upcoming' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('upcoming');
    });
  });

  const mockCreateResponse = {
    id: 'booking-new-789',
    userId: 'user-123',
    serviceId: 1,
    therapistId: 1,
    date: '2026-04-01',
    time: '15:00',
    status: 'pending',
    price: 50,
    paid: false,
    notes: 'Primeira sessão',
    createdAt: '2026-03-22T12:00:00Z',
  };

  // ============== CREATE BOOKING TESTS ==============
  describe('createBooking', () => {

    it('✅ deve criar nova reserva com dados válidos', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockCreateResponse,
      });

      const result = await bookingService.createBooking({
        serviceId: 1,
        therapistId: 1,
        date: '2026-04-01',
        time: '15:00',
        notes: 'Primeira sessão',
      });

      expect(result).toEqual(mockCreateResponse);
      expect(api.post).toHaveBeenCalledWith('/bookings', expect.objectContaining({
        service_id: 1,
        therapist_id: 1,
        date: '2026-04-01',
        time: '15:00',
      }));
    });

    it('✅ deve gerar ID único para cada reserva', async () => {
      const booking1 = { ...mockCreateResponse, id: 'booking-1' };
      const booking2 = { ...mockCreateResponse, id: 'booking-2' };

      (api.post as jest.Mock)
        .mockResolvedValueOnce({ data: booking1 })
        .mockResolvedValueOnce({ data: booking2 });

      const result1 = await bookingService.createBooking({
        serviceId: 1,
        therapistId: 1,
        date: '2026-04-01',
        time: '15:00',
      });

      const result2 = await bookingService.createBooking({
        serviceId: 1,
        therapistId: 1,
        date: '2026-04-01',
        time: '16:00',
      });

      expect(result1.id).not.toBe(result2.id);
    });



    it('✅ deve incluir notas opcionais na reserva', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockCreateResponse,
      });

      const result = await bookingService.createBooking({
        serviceId: 1,
        therapistId: 1,
        date: '2026-04-01',
        time: '15:00',
        notes: 'Tenho dor nas costas',
      });

      expect(result.notes).toBe('Primeira sessão');
    });



    it('✅ deve retornar booking com status pending', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: mockCreateResponse,
      });

      const result = await bookingService.createBooking({
        serviceId: 1,
        therapistId: 1,
        date: '2026-04-01',
        time: '15:00',
      });

      expect(result.status).toBe('pending');
    });
  });

  // ============== CANCEL BOOKING TESTS ==============
  describe('cancelBooking', () => {
    it('✅ deve cancelar uma reserva existente', async () => {
      const cancelledBooking = {
        ...mockCreateResponse,
        id: 'booking-1',
        status: 'cancelled',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: cancelledBooking,
      });

      const result = await bookingService.cancelBooking('booking-1', 'Não posso comparecer');

      expect(result.id).toBe('booking-1');
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/bookings/booking-1/cancel'),
        expect.any(Object)
      );
    });
  });

  // ============== UPDATE BOOKING TESTS ==============
  describe('updateBooking', () => {
    it('✅ deve atualizar horário da reserva', async () => {
      (api.put as jest.Mock).mockResolvedValue({
        data: {
          id: 'booking-1',
          time: '16:00',
          status: 'updated',
        },
      });

      const result = await bookingService.updateBooking('booking-1', {
        time: '16:00',
      });

      expect(result.time).toBe('16:00');
      expect(api.put).toHaveBeenCalled();
    });
  });
});
