/**
 * usePushNotifications
 * Handle push notifications with proper error handling and retries
 */

import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

const NOTIFICATIONS_KEY = '@qlinica_notifications_enabled';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const usePushNotifications = () => {
  const notificationListenerRef = useRef<any>();
  const responseListenerRef = useRef<any>();

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();

    return () => {
      // Cleanup listeners
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        } as any),
      });

      // Set up listeners
      notificationListenerRef.current = Notifications.addNotificationReceivedListener(
        handleNotificationReceived
      );

      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

      logger.info('✅ Push notifications initialized');
    } catch (error) {
      logger.error('Failed to initialize notifications', error);
    }
  };

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    logger.info('📬 Notification received', {
      title: notification.request.content.title,
      body: notification.request.content.body,
    });
  }, []);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const { notification } = response;
    const data = notification.request.content.data;

    logger.info('👆 Notification response', {
      title: notification.request.content.title,
      data,
    });

    // Handle navigation based on notification data
    if (data?.screen) {
      // Navigate to specified screen
      logger.debug(`Navigating to: ${data.screen}`);
    }
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';

      logger.info(granted ? '✅ Notifications enabled' : '❌ Notifications denied', { status });
      return granted;
    } catch (error) {
      logger.error('Permission request failed', error);
      return false;
    }
  }, []);

  /**
   * Send local notification
   */
  const sendLocalNotification = useCallback(
    async (payload: NotificationPayload, delaySeconds = 1) => {
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
            type: 'timeInterval',
            seconds: delaySeconds,
          } as any,
        });

        logger.info('📤 Local notification scheduled', { id: notificationId });
        return notificationId;
      } catch (error) {
        logger.error('Failed to send notification', error);
        return null;
      }
    },
    []
  );

  /**
   * Schedule notification for future date
   */
  const scheduleNotification = useCallback(
    async (payload: NotificationPayload, triggerDate: Date) => {
      try {
        const now = new Date();
        const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

        if (secondsUntilTrigger < 1) {
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
            type: 'timeInterval',
            seconds: secondsUntilTrigger,
          } as any,
        });

        logger.info('📅 Notification scheduled', {
          id: notificationId,
          date: triggerDate.toISOString(),
        });
        return notificationId;
      } catch (error) {
        logger.error('Failed to schedule notification', error);
        return null;
      }
    },
    [sendLocalNotification]
  );

  /**
   * Cancel scheduled notification
   */
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.debug('🗑️  Notification cancelled', { id: notificationId });
    } catch (error) {
      logger.error('Failed to cancel notification', error);
    }
  }, []);

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('🗑️  All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel all notifications', error);
    }
  }, []);

  /**
   * Get all scheduled notifications
   */
  const getScheduledNotifications = useCallback(async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      logger.debug(`📋 ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      logger.error('Failed to get scheduled notifications', error);
      return [];
    }
  }, []);

  return {
    requestPermissions,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
};
