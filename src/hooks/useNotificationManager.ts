/**
 * useNotificationManager
 * Hook for managing notification operations
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
  NotificationPayload,
} from '../services/notificationService';

interface NotificationHandlers {
  onBookingConfirmation?: (bookingData: any) => void;
  onReminder?: (reminderData: any) => void;
  onCancellation?: (cancellationData: any) => void;
  onReschedule?: (rescheduleData: any) => void;
  onPayment?: (paymentData: any) => void;
  onReview?: (reviewData: any) => void;
}

// Default notification settings
const DEFAULT_SETTINGS = {
  enabled: true,
  bookingConfirmation: true,
  appointmentReminders: true,
  reminderTime: 24 * 60, // minutes before appointment
  cancellationNotices: true,
  rescheduling: true,
  paymentNotifications: true,
  reviewRequests: true,
};

export function useNotificationManager(handlers?: NotificationHandlers) {
  const unsubscribeRef = useRef<Array<() => void>>([]);

  /**
   * Send a booking confirmation notification
   */
  const notifyBookingConfirmation = useCallback(
    async (therapistName: string, serviceName: string, dateTime: Date | string) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.bookingConfirmation) return;

      try {
        const appointmentDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        await sendBookingConfirmationNotification(therapistName, serviceName, appointmentDate);
        handlers?.onBookingConfirmation?.({
          therapistName,
          serviceName,
          dateTime: appointmentDate,
        });
      } catch (error) {
        console.error('Error sending booking confirmation:', error);
      }
    },
    [handlers]
  );

  /**
   * Send appointment reminder notification
   */
  const notifyReminder = useCallback(
    async (therapistName: string, serviceName: string, dateTime: Date | string, minutesBefore?: number) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.appointmentReminders) return;

      try {
        const appointmentDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        const reminderTime = minutesBefore ?? DEFAULT_SETTINGS.reminderTime;
        await sendAppointmentReminderNotification(therapistName, serviceName, appointmentDate, reminderTime);
        handlers?.onReminder?.({
          therapistName,
          serviceName,
          dateTime: appointmentDate,
          minutesBefore: reminderTime,
        });
      } catch (error) {
        console.error('Error sending reminder notification:', error);
      }
    },
    [handlers]
  );

  /**
   * Send cancellation notification
   */
  const notifyCancellation = useCallback(
    async (therapistName: string, serviceName: string, cancelledDate?: Date | string) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.cancellationNotices) return;

      try {
        const dateToPass = cancelledDate 
          ? (typeof cancelledDate === 'string' ? new Date(cancelledDate) : cancelledDate)
          : new Date();
        await sendCancellationNotification(therapistName, serviceName, dateToPass);
        handlers?.onCancellation?.({
          therapistName,
          serviceName,
          cancelledDate: dateToPass,
        });
      } catch (error) {
        console.error('Error sending cancellation notification:', error);
      }
    },
    [handlers]
  );

  /**
   * Send reschedule notification
   */
  const notifyReschedule = useCallback(
    async (therapistName: string, serviceName: string, newDate: Date | string, oldDate: Date | string) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.rescheduling) return;

      try {
        const newAppointmentDate = typeof newDate === 'string' ? new Date(newDate) : newDate;
        const oldAppointmentDate = typeof oldDate === 'string' ? new Date(oldDate) : oldDate;
        await sendRescheduleNotification(therapistName, serviceName, newAppointmentDate, oldAppointmentDate);
        handlers?.onReschedule?.({
          therapistName,
          serviceName,
          oldDate: oldAppointmentDate,
          newDate: newAppointmentDate,
        });
      } catch (error) {
        console.error('Error sending reschedule notification:', error);
      }
    },
    [handlers]
  );

  /**
   * Send payment notification
   */
  const notifyPayment = useCallback(
    async (amount: number, bookingId: string) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.paymentNotifications) return;

      try {
        await sendPaymentNotification(amount, bookingId);
        handlers?.onPayment?.({
          amount,
          bookingId,
        });
      } catch (error) {
        console.error('Error sending payment notification:', error);
      }
    },
    [handlers]
  );

  /**
   * Send review request notification
   */
  const notifyReviewRequest = useCallback(
    async (therapistName: string, serviceName: string, bookingId: string) => {
      if (!DEFAULT_SETTINGS.enabled || !DEFAULT_SETTINGS.reviewRequests) return;

      try {
        await sendReviewRequestNotification(therapistName, serviceName, bookingId);
        handlers?.onReview?.({
          therapistName,
          serviceName,
          bookingId,
        });
      } catch (error) {
        console.error('Error sending review request notification:', error);
      }
    },
    [handlers]
  );

  /**
   * Send custom local notification
   */
  const sendNotification = useCallback(
    async (payload: NotificationPayload) => {
      try {
        await sendLocalNotification(payload, 1);
      } catch (error) {
        console.error('Error sending local notification:', error);
      }
    },
    []
  );

  /**
   * Schedule notification for later
   */
  const scheduleNotificationLater = useCallback(
    async (payload: NotificationPayload, triggerDate: Date) => {
      try {
        return await scheduleNotification(payload, triggerDate);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    },
    []
  );

  /**
   * Cancel scheduled notification
   */
  const cancelScheduledNotification = useCallback(
    async (notificationId: string) => {
      try {
        await cancelNotification(notificationId);
      } catch (error) {
        console.error('Error cancelling notification:', error);
      }
    },
    []
  );

  /**
   * Setup notification listeners
   */
  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    // Handle notification received
    const subscription1 = onNotificationReceived((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification response
    const subscription2 = onNotificationResponse((response) => {
      console.log('Notification response:', response);
    });

    if (subscription1) subscriptions.push(subscription1);
    if (subscription2) subscriptions.push(subscription2);

    unsubscribeRef.current = subscriptions;

    return () => {
      subscriptions.forEach((unsub) => unsub?.());
    };
  }, []);

  return {
    notifyBookingConfirmation,
    notifyReminder,
    notifyCancellation,
    notifyReschedule,
    notifyPayment,
    notifyReviewRequest,
    sendNotification,
    scheduleNotificationLater,
    cancelScheduledNotification,
  };
}
