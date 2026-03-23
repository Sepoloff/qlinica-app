/**
 * NotificationSystemContext
 * Centralized notification management with queue, animations, and priority levels
 */

import React, { createContext, useCallback, useState, useRef, useEffect } from 'react';
import { Vibration } from 'react-native';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top' | 'bottom' | 'center';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // in ms, 0 = persistent
  position?: NotificationPosition;
  action?: {
    label: string;
    onPress: () => void;
  };
  vibration?: boolean;
  sound?: boolean;
  timestamp: number;
}

interface NotificationSystemContextType {
  notifications: Notification[];
  show: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  hide: (id: string) => void;
  clear: () => void;
  update: (id: string, updates: Partial<Notification>) => void;
}

export const NotificationSystemContext = createContext<NotificationSystemContextType | undefined>(
  undefined,
);

interface NotificationSystemProviderProps {
  children: React.ReactNode;
}

const NOTIFICATION_ID_PREFIX = 'notif_';

export const NotificationSystemProvider: React.FC<NotificationSystemProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const nextIdRef = useRef(0);

  // Generate unique ID
  const generateId = useCallback((): string => {
    return `${NOTIFICATION_ID_PREFIX}${nextIdRef.current++}_${Date.now()}`;
  }, []);

  // Show notification
  const show = useCallback(
    (notificationData: Omit<Notification, 'id' | 'timestamp'>): string => {
      const id = generateId();
      const notification: Notification = {
        ...notificationData,
        id,
        timestamp: Date.now(),
        duration: notificationData.duration ?? 4000, // Default 4 seconds
        position: notificationData.position ?? 'top',
      };

      setNotifications((prev) => [...prev, notification]);

      // Haptic feedback
      if (notification.vibration) {
        Vibration.vibrate(50);
      }

      // Auto-dismiss if duration is set
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          hide(id);
        }, notification.duration);

        notificationTimersRef.current.set(id, timer);
      }

      return id;
    },
    [generateId],
  );

  // Hide notification
  const hide = useCallback((id: string) => {
    // Clear timer if exists
    const timer = notificationTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      notificationTimersRef.current.delete(id);
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clear = useCallback(() => {
    // Clear all timers
    notificationTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    notificationTimersRef.current.clear();

    setNotifications([]);
  }, []);

  // Update notification
  const update = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    );

    // Update timer if duration changed
    if (updates.duration !== undefined && updates.duration > 0) {
      const existingTimer = notificationTimersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        hide(id);
      }, updates.duration);

      notificationTimersRef.current.set(id, timer);
    }
  }, [hide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const value: NotificationSystemContextType = {
    notifications,
    show,
    hide,
    clear,
    update,
  };

  return (
    <NotificationSystemContext.Provider value={value}>
      {children}
    </NotificationSystemContext.Provider>
  );
};

/**
 * Hook to use notification system
 */
export const useNotificationSystem = (): NotificationSystemContextType => {
  const context = React.useContext(NotificationSystemContext);
  if (!context) {
    throw new Error(
      'useNotificationSystem must be used within NotificationSystemProvider',
    );
  }
  return context;
};

/**
 * Convenience hooks for specific notification types
 */

export const useNotifications = () => {
  const { show, hide, clear, update } = useNotificationSystem();

  return {
    success: (message: string, title?: string, duration?: number) =>
      show({
        type: 'success',
        message,
        title,
        duration,
        vibration: true,
      }),
    error: (message: string, title?: string, duration?: number) =>
      show({
        type: 'error',
        message,
        title,
        duration: duration ?? 5000, // Errors persist longer
        vibration: true,
      }),
    warning: (message: string, title?: string, duration?: number) =>
      show({
        type: 'warning',
        message,
        title,
        duration,
        vibration: true,
      }),
    info: (message: string, title?: string, duration?: number) =>
      show({
        type: 'info',
        message,
        title,
        duration,
      }),
    hide,
    clear,
    update,
  };
};
