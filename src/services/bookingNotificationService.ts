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

      await notificationService.sendLocalNotification({
        title: '✅ Reserva Criada',
        body: `${serviceName} com ${therapistName} marcada para ${booking.date} às ${booking.time}`,
        bookingId: booking.id,
        data: {
          action: 'booking_created',
          bookingId: booking.id,
          type: 'booking',
        },
      });

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

      await notificationService.sendLocalNotification({
        title: '🎯 Reserva Confirmada',
        body: `${therapistName} confirmou sua sessão para ${booking.date} às ${booking.time}`,
        bookingId: booking.id,
        data: {
          action: 'booking_confirmed',
          bookingId: booking.id,
          type: 'booking',
        },
      });

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

        await notificationService.scheduleNotification(
          {
            title: '📅 Lembrete: Sessão Amanhã',
            body: `Você tem sessão com ${therapistName} amanhã às ${booking.time}`,
            bookingId: booking.id,
            data: {
              action: 'booking_reminder',
              bookingId: booking.id,
              type: 'reminder',
            },
          },
          reminderTime
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
        const reminderTime = secondsUntil - HOURS_1; // 1 hora antes

        const therapistName = booking.therapist?.name || 'seu terapeuta';

        await notificationService.scheduleNotification(
          {
            title: '🔔 Sua sessão começa em 1 hora',
            body: `Prepare-se! Sessão com ${therapistName} em ${booking.time}`,
            bookingId: booking.id,
            data: {
              action: 'booking_reminder_soon',
              bookingId: booking.id,
              type: 'reminder',
            },
          },
          reminderTime
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
  static async notifyBookingCancelled(booking: Booking, reason?: string): Promise<void> {
    try {
      const therapistName = booking.therapist?.name || 'seu terapeuta';

      await notificationService.sendLocalNotification({
        title: '❌ Reserva Cancelada',
        body: reason || `Sua sessão com ${therapistName} foi cancelada`,
        bookingId: booking.id,
        data: {
          action: 'booking_cancelled',
          bookingId: booking.id,
          type: 'booking',
        },
      });

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

      // Agendar para 1 hora depois da sessão
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const duration = booking.duration || 60; // minutos
      const reviewTime =
        (bookingDate.getTime() + duration * 60 * 1000 - new Date().getTime()) /
        1000;

      if (reviewTime > 0) {
        await notificationService.scheduleNotification(
          {
            title: '⭐ Como foi sua sessão?',
            body: `Avalie sua experiência com ${therapistName} e nos ajude a melhorar`,
            bookingId: booking.id,
            data: {
              action: 'request_review',
              bookingId: booking.id,
              type: 'review',
            },
          },
          Math.max(reviewTime, 1)
        );

        console.log(
          `⭐ Pedido de avaliação agendado para ${
            duration + Math.round(reviewTime / 60)
          } minutos`
        );
      }
    } catch (error) {
      console.error('❌ Erro ao agendar pedido de avaliação:', error);
    }
  }

  /**
   * Notificar falha de sincronização offline
   */
  static async notifyOfflineSyncFailed(operationId: string): Promise<void> {
    try {
      await notificationService.sendLocalNotification({
        title: '⚠️ Erro na Sincronização',
        body: 'Falha ao sincronizar sua reserva. Tentando novamente...',
        data: {
          action: 'sync_failed',
          operationId,
          type: 'error',
        },
      });

      console.log(`⚠️ Notificação: Falha de sync (${operationId})`);
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

      await notificationService.sendLocalNotification({
        title: '✅ Sincronização Completa',
        body: `${count} ${plural} sincronizada(s) com sucesso!`,
        data: {
          action: 'sync_success',
          count,
          type: 'success',
        },
      });

      console.log(`✅ Notificação: ${count} operação(ões) sincronizada(s)`);
    } catch (error) {
      console.error('❌ Erro ao notificar sucesso de sync:', error);
    }
  }

  /**
   * Notificar disponibilidade de novo slot com terapeuta favorito
   */
  static async notifyTherapistAvailable(therapistName: string): Promise<void> {
    try {
      await notificationService.sendLocalNotification({
        title: '🌟 Novo Horário Disponível',
        body: `${therapistName} tem novo horário disponível. Marque agora!`,
        data: {
          action: 'therapist_available',
          therapistName,
          type: 'opportunity',
        },
      });

      console.log(`🌟 Notificação: ${therapistName} disponível`);
    } catch (error) {
      console.error('❌ Erro ao notificar disponibilidade:', error);
    }
  }
}

export const bookingNotificationService = BookingNotificationService;
