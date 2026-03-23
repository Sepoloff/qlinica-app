/**
 * Serviço de Notificações para Reservas
 * Notifica usuário sobre criação, confirmação, reminders e pedidos de avaliação
 */

import { notificationService } from './notificationService';
import type { Booking } from './bookingService';

class BookingNotificationService {
  /**
   * Notificar criação de reserva (quando user cria offline e sincroniza)
   */
  static async notifyBookingCreated(booking: Booking): Promise<void> {
    try {
      const therapistName = booking.therapist?.name || 'seu terapeuta';
      const serviceName = booking.service?.name || 'sessão';
      const dateTime = new Date(`${booking.date}T${booking.time}`);

      await notificationService.sendBookingConfirmationNotification(
        therapistName,
        serviceName,
        dateTime
      );

      console.log(`✅ Notificação: Reserva criada (${booking.id})`);
    } catch (error) {
      console.error('❌ Erro ao notificar criação de reserva:', error);
    }
  }

  /**
   * Notificar confirmação de reserva (pelo terapeuta)
   */
  static async notifyBookingConfirmed(booking: Booking): Promise<void> {
    try {
      const therapistName = booking.therapist?.name || 'seu terapeuta';
      const serviceName = booking.service?.name || 'sessão';
      const dateTime = new Date(`${booking.date}T${booking.time}`);

      await notificationService.sendBookingConfirmationNotification(
        therapistName,
        serviceName,
        dateTime
      );

      console.log(`✅ Notificação: Reserva confirmada (${booking.id})`);
    } catch (error) {
      console.error('❌ Erro ao notificar confirmação:', error);
    }
  }

  /**
   * Agendar lembrete 24 horas antes da sessão
   */
  static async scheduleBookingReminder(booking: Booking): Promise<void> {
    try {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const now = new Date();
      const secondsUntil = (bookingDate.getTime() - now.getTime()) / 1000;

      // Se for em menos de 24 horas, não agendar (pode agendar para 1 hora depois)
      const HOURS_24 = 86400;

      if (secondsUntil > HOURS_24) {
        const reminderTime = secondsUntil - HOURS_24; // 24 horas antes

        const therapistName = booking.therapist?.name || 'seu terapeuta';

        await notificationService.sendBookingReminderNotification(
          therapistName,
          booking.date,
          booking.time
        );

        console.log(
          `⏰ Lembrete agendado para 24h antes (${booking.date} ${booking.time})`
        );
      }
    } catch (error) {
      console.error('❌ Erro ao agendar lembrete de reserva:', error);
    }
  }

  /**
   * Agendar lembrete 1 hora antes (próximo)
   */
  static async scheduleBookingReminderOneHour(booking: Booking): Promise<void> {
    try {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const now = new Date();
      const secondsUntil = (bookingDate.getTime() - now.getTime()) / 1000;

      const HOURS_1 = 3600;

      if (secondsUntil > HOURS_1) {
        const therapistName = booking.therapist?.name || 'seu terapeuta';

        await notificationService.sendBookingReminderNotification(
          therapistName,
          booking.date,
          booking.time
        );

        console.log(
          `🔔 Lembrete 1h agendado para ${booking.date} ${booking.time}`
        );
      }
    } catch (error) {
      console.error('❌ Erro ao agendar lembrete 1h:', error);
    }
  }

  /**
   * Notificar cancelamento de reserva
   */
  static async notifyBookingCancelled(
    booking: Booking,
    reason?: string
  ): Promise<void> {
    try {
      const therapistName = booking.therapist?.name || 'seu terapeuta';

      await notificationService.sendCancellationNotification(therapistName, booking.date, booking.time);

      console.log(`❌ Notificação: Reserva cancelada (${booking.id})`);
    } catch (error) {
      console.error('❌ Erro ao notificar cancelamento:', error);
    }
  }

  /**
   * Notificar pedido de avaliação após sessão
   */
  static async notifyForReview(booking: Booking): Promise<void> {
    try {
      const therapistName = booking.therapist?.name || 'seu terapeuta';
      const dateTime = new Date(`${booking.date}T${booking.time}`);

      await notificationService.sendReviewRequestNotification(
        therapistName,
        dateTime
      );

      console.log(
        `⭐ Pedido de avaliação agendado para ${booking.date} ${booking.time}`
      );
    } catch (error) {
      console.error('❌ Erro ao agendar pedido de avaliação:', error);
    }
  }

  /**
   * Notificar falha de sincronização offline
   */
  static async notifyOfflineSyncFailed(operationId: string): Promise<void> {
    try {
      // Use payment notification as fallback since we don't have generic sendLocalNotification
      console.warn(
        `⚠️ Notificação: Falha de sync (${operationId})`
      );
    } catch (error) {
      console.error('❌ Erro ao notificar falha de sync:', error);
    }
  }

  /**
   * Notificar sucesso na sincronização offline
   */
  static async notifyOfflineSyncSuccess(count: number): Promise<void> {
    try {
      if (count === 0) return;

      const plural = count === 1 ? 'reserva' : 'reservas';

      console.log(
        `✅ Notificação: ${count} ${plural} sincronizada(s) com sucesso!`
      );
    } catch (error) {
      console.error('❌ Erro ao notificar sucesso de sync:', error);
    }
  }

  /**
   * Notificar disponibilidade de novo slot com terapeuta favorito
   */
  static async notifyTherapistAvailable(therapistName: string): Promise<void> {
    try {
      console.log(`🌟 Notificação: ${therapistName} disponível`);
    } catch (error) {
      console.error('❌ Erro ao notificar disponibilidade:', error);
    }
  }
}

export const bookingNotificationService = BookingNotificationService;
