/**
 * useNotificationManager
 * Hook for managing notification operations with context-aware settings
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  sendLocalNotification,
  scheduleNotification,
  cancelNotification,
  sendBookingConfirmationNotification,
  sendAppointmentReminderNotification,
  sendCancellationNotification,
  sendRescheduleNotification,
  sendPaymentNotification,
  sendReviewRequestNotification,
  onNotificationResponse,
  onNotificationReceived,
} from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';

interface NotificationHandlers {
  onBookingConfirmation?: (bookingData: any) => void;
  onReminder?: (reminderData: any) => void;
  onCancellation?: (cancellationData: any) => void;
  onReschedule?: (rescheduleData: any) => void;
  onPayment?: (paymentData: any) => void;
  onReview?: (reviewData: any) => void;
}

export function useNotificationManager(handlers?: NotificationHandlers) {
  const { settings } = useNotifications();
  const unsubscribeRef = useRef<(() => void)[]>([]);

  /**
   * Send a booking confirmation notification if enabled
   */
  const notifyBookingConfirmation = useCallback(
    async (therapistName: string, serviceName: string, dateTime: Date) => {
      if (!settings.enabled || !settings.bookingConfirmation) return;

      try {
        await sendBookingConfirmationNotification(therapistName, serviceName, dateTime);
      } catch (error) {
        console.error('Error sending booking confirmation:', error);
      }
    },
    [settings.enabled, settings.bookingConfirmation]
  );

  /**
   * Schedule an appointment reminder if enabled
   */
  const scheduleAppointmentReminder = useCallback(
    async (
      therapistName: string,
      serviceName: string,
      appointmentDate: Date,
      minutesBefore?: number
    ) => {
      if (!settings.enabled || !settings.appointmentReminders) return;

      try {
        const reminderTime = minutesBefore || settings.reminderTime;
        await sendAppointmentReminderNotification(
          therapistName,
          serviceName,
          appointmentDate,
          reminderTime
        );
      } catch (error) {
        console.error('Error scheduling appointment reminder:', error);
      }
    },
    [settings.enabled, settings.appointmentReminders, settings.reminderTime]
  );

  /**
   * Send a cancellation notification if enabled
   */
  const notifyCancellation = useCallback(
    async (therapistName: string, serviceName: string, originalDate: Date) => {
      if (!settings.enabled || !settings.cancellationNotices) return;

      try {
        await sendCancellationNotification(therapistName, serviceName, originalDate);
      } catch (error) {
        console.error('Error sending cancellation notification:', error);
      }
    },
    [settings.enabled, settings.cancellationNotices]
  );

  /**
   * Send a reschedule notification if enabled
   */
  const notifyReschedule = useCallback(
    async (
      therapistName: string,
      serviceName: string,
      newDate: Date,
      oldDate: Date
    ) => {
      if (!settings.enabled || !settings.rescheduling) return;

      try {
        await sendRescheduleNotification(therapistName, serviceName, newDate, oldDate);
      } catch (error) {
        console.error('Error sending reschedule notification:', error);
      }
    },
    [settings.enabled, settings.rescheduling]
  );

  /**
   * Send a payment notification if enabled
   */
  const notifyPayment = useCallback(
    async (amount: number, bookingId: string) => {
      if (!settings.enabled || !settings.paymentNotifications) return;

      try {
        await sendPaymentNotification(amount, bookingId);
      } catch (error) {
        console.error('Error sending payment notification:', error);
      }
    },
    [settings.enabled, settings.paymentNotifications]
  );

  /**
   * Send a review request notification if enabled
   */
  const notifyReviewRequest = useCallback(
    async (therapistName: string, serviceName: string, bookingId: string) => {
      if (!settings.enabled || !settings.reviewRequests) return;

      try {
        await sendReviewRequestNotification(therapistName, serviceName, bookingId);
      } catch (error) {
        console.error('Error sending review request notification:', error);
      }
    },
    [settings.enabled, settings.reviewRequests]
  );

  /**
   * Send a custom notification
   */
  const sendCustomNotification = useCallback(
    async (title: string, body: string, data?: Record<string, any>) => {
      if (!settings.enabled) return;

      try {
        await sendLocalNotification({ title, body, data });
      } catch (error) {
        console.error('Error sending custom notification:', error);
      }
    },
    [settings.enabled]
  );

  /**
   * Cancel a scheduled notification
   */
  const cancel = useCallback(async (notificationId: string) => {
    try {
      await cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }, []);

  // Setup notification listeners on mount
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen to notification responses (when user taps a notification)
    unsubscribers.push(
      onNotificationResponse((notification) => {
        const trigger = notification.request.content.data?.type;

        switch (trigger) {
          case 'booking':
            handlers?.onBookingConfirmation?.(notification.request.content.data);
            break;
          case 'reminder':
            handlers?.onReminder?.(notification.request.content.data);
            break;
          case 'cancellation':
            handlers?.onCancellation?.(notification.request.content.data);
            break;
          case 'reschedule':
            handlers?.onReschedule?.(notification.request.content.data);
            break;
          case 'payment':
            handlers?.onPayment?.(notification.request.content.data);
            break;
          case 'review':
            handlers?.onReview?.(notification.request.content.data);
            break;
        }
      })
    );

    // Listen to notifications received in foreground
    unsubscribers.push(
      onNotificationReceived((notification) => {
        console.log('Notification received:', notification);
      })
    );

    unsubscribeRef.current = unsubscribers;

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [handlers]);

  return {
    notifyBookingConfirmation,
    scheduleAppointmentReminder,
    notifyCancellation,
    notifyReschedule,
    notifyPayment,
    notifyReviewRequest,
    sendCustomNotification,
    cancel,
  };
}
