/**
 * Notification Service
 * Handles push notifications and local notifications for the Qlinica app
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how the app handles notifications when it's in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: 'booking' | 'reminder' | 'cancellation' | 'reschedule' | 'review' | 'payment';
}

export interface LocalNotificationTrigger {
  seconds: number;
}

export interface PushTokenData {
  token: string;
  device: string;
  deviceName?: string;
  lastUpdated: number;
}

/**
 * Initialize notifications setup
 * Call this once during app startup
 */
export async function initializeNotifications() {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device. Skipping setup.');
    return;
  }

  try {
    // Request notification permissions if not already granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    // Get the Expo Push Token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
    });

    await storePushToken(token.data);
    return token.data;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    throw error;
  }
}

/**
 * Store the push token in AsyncStorage for backend sync
 */
async function storePushToken(token: string): Promise<void> {
  try {
    const deviceName = Device.deviceName || 'unknown';
    const tokenData: PushTokenData = {
      token,
      device: Device.modelName || 'unknown',
      deviceName,
      lastUpdated: Date.now(),
    };

    await AsyncStorage.setItem(
      '@qlinica_push_token',
      JSON.stringify(tokenData)
    );
  } catch (error) {
    console.error('Error storing push token:', error);
  }
}

/**
 * Retrieve stored push token
 */
export async function getPushToken(): Promise<PushTokenData | null> {
  try {
    const tokenJson = await AsyncStorage.getItem('@qlinica_push_token');
    return tokenJson ? JSON.parse(tokenJson) : null;
  } catch (error) {
    console.error('Error retrieving push token:', error);
    return null;
  }
}

/**
 * Send a local notification (useful for testing or local reminders)
 */
export async function sendLocalNotification(
  payload: NotificationPayload,
  delaySeconds: number = 1
): Promise<string | undefined> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: {
        seconds: delaySeconds,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    throw error;
  }
}

/**
 * Schedule a notification for a future time
 * Useful for appointment reminders
 */
export async function scheduleNotification(
  payload: NotificationPayload,
  triggerDate: Date
): Promise<string | undefined> {
  try {
    const now = new Date();
    const secondsUntilTrigger = Math.floor(
      (triggerDate.getTime() - now.getTime()) / 1000
    );

    if (secondsUntilTrigger < 0) {
      console.warn('Trigger date is in the past, using 1 second delay');
      return sendLocalNotification(payload, 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: {
        seconds: secondsUntilTrigger,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.Notification[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send booking confirmation notification
 */
export async function sendBookingConfirmationNotification(
  therapistName: string,
  serviceName: string,
  dateTime: Date
): Promise<string | undefined> {
  const formattedDate = dateTime.toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return sendLocalNotification({
    title: '✅ Agendamento Confirmado',
    body: `${serviceName} com ${therapistName} em ${formattedDate}`,
    data: {
      type: 'booking',
      therapist: therapistName,
      service: serviceName,
      dateTime: dateTime.toISOString(),
    },
    trigger: 'booking',
  });
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminderNotification(
  therapistName: string,
  serviceName: string,
  appointmentDate: Date,
  minutesBefore: number = 60
): Promise<string | undefined> {
  const reminderTime = new Date(appointmentDate.getTime() - minutesBefore * 60 * 1000);

  return scheduleNotification({
    title: '🕐 Lembrete de Agendamento',
    body: `Consulta com ${therapistName} em ${minutesBefore} minutos`,
    data: {
      type: 'reminder',
      therapist: therapistName,
      service: serviceName,
      minutesBefore,
    },
    trigger: 'reminder',
  }, reminderTime);
}

/**
 * Send cancellation notification
 */
export async function sendCancellationNotification(
  therapistName: string,
  serviceName: string,
  originalDate: Date
): Promise<string | undefined> {
  return sendLocalNotification({
    title: '❌ Agendamento Cancelado',
    body: `Sua consulta com ${therapistName} (${serviceName}) foi cancelada.`,
    data: {
      type: 'cancellation',
      therapist: therapistName,
      service: serviceName,
      originalDate: originalDate.toISOString(),
    },
    trigger: 'cancellation',
  });
}

/**
 * Send reschedule notification
 */
export async function sendRescheduleNotification(
  therapistName: string,
  serviceName: string,
  newDate: Date,
  oldDate: Date
): Promise<string | undefined> {
  const formattedDate = newDate.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return sendLocalNotification({
    title: '📅 Agendamento Remarcado',
    body: `Consulta com ${therapistName} agora marcada para ${formattedDate}`,
    data: {
      type: 'reschedule',
      therapist: therapistName,
      service: serviceName,
      newDate: newDate.toISOString(),
      oldDate: oldDate.toISOString(),
    },
    trigger: 'reschedule',
  });
}

/**
 * Send payment received notification
 */
export async function sendPaymentNotification(
  amount: number,
  bookingId: string
): Promise<string | undefined> {
  return sendLocalNotification({
    title: '💳 Pagamento Recebido',
    body: `Pagamento de €${amount.toFixed(2)} confirmado com sucesso`,
    data: {
      type: 'payment',
      amount,
      bookingId,
    },
    trigger: 'payment',
  });
}

/**
 * Send review request notification
 */
export async function sendReviewRequestNotification(
  therapistName: string,
  serviceName: string,
  bookingId: string
): Promise<string | undefined> {
  return sendLocalNotification({
    title: '⭐ Avalie sua Experiência',
    body: `Sua consulta com ${therapistName} foi concluída. Deixe-nos uma avaliação!`,
    data: {
      type: 'review',
      therapist: therapistName,
      service: serviceName,
      bookingId,
    },
    trigger: 'review',
  });
}

/**
 * Listen to notification responses (when user taps a notification)
 * Returns unsubscribe function
 */
export function onNotificationResponse(
  callback: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      callback(response.notification);
    }
  );

  return () => subscription.remove();
}

/**
 * Listen to notifications received in foreground
 * Returns unsubscribe function
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      callback(notification);
    }
  );

  return () => subscription.remove();
}
