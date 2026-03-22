/**
 * NotificationContext
 * Manages notification settings and preferences for the user
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface NotificationSettings {
  enabled: boolean;
  bookingConfirmation: boolean;
  appointmentReminders: boolean;
  reminderTime: number; // minutes before appointment
  cancellationNotices: boolean;
  rescheduling: boolean;
  paymentNotifications: boolean;
  reviewRequests: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  bookingConfirmation: true,
  appointmentReminders: true,
  reminderTime: 60, // 1 hour before
  cancellationNotices: true,
  rescheduling: true,
  paymentNotifications: true,
  reviewRequests: true,
};

interface NotificationContextType {
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load notification settings from AsyncStorage
   */
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const savedSettings = await AsyncStorage.getItem('@qlinica_notification_settings');

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...parsed,
        });
      } else {
        setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error loading notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      try {
        setError(null);
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        // Save to AsyncStorage
        await AsyncStorage.setItem(
          '@qlinica_notification_settings',
          JSON.stringify(updatedSettings)
        );

        // If enabling/disabling all notifications, update Expo settings
        if (newSettings.enabled !== undefined) {
          if (!newSettings.enabled) {
            await Notifications.dismissAllNotificationsAsync();
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
        setError(errorMessage);
        console.error('Error updating notification settings:', err);
        throw err;
      }
    },
    [settings]
  );

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      await AsyncStorage.removeItem('@qlinica_notification_settings');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(errorMessage);
      console.error('Error resetting notification settings:', err);
      throw err;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: NotificationContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    loadSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 */
export function useNotifications(): NotificationContextType {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
