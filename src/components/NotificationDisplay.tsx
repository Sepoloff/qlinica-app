/**
 * NotificationDisplay Component
 * Renders all notifications from the notification system
 * Should be placed at the root level of the app
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text as RNText,
  SafeAreaView,
} from 'react-native';
import { useNotificationSystem, Notification } from '../context/NotificationSystemContext';
import { useTheme } from '../context/ThemeContext';

const NotificationDisplay: React.FC = () => {
  const { notifications, hide } = useNotificationSystem();
  const { colors, isDark } = useTheme();

  const groupedNotifications = useMemo(() => {
    const grouped: Record<string, Notification[]> = {
      top: [],
      center: [],
      bottom: [],
    };

    notifications.forEach((notif) => {
      const position = notif.position || 'top';
      grouped[position].push(notif);
    });

    return grouped;
  }, [notifications]);

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
    }
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const bgColor = getNotificationColor(notification.type);
    const icon = getNotificationIcon(notification.type);

    return (
      <Pressable
        style={[
          styles.notificationContainer,
          {
            backgroundColor: bgColor,
            shadowColor: bgColor,
          },
        ]}
        onPress={() => hide(notification.id)}
        delayLongPress={0}
      >
        <View style={styles.notificationContent}>
          <RNText style={[styles.notificationIcon, { color: colors.white }]}>
            {icon}
          </RNText>

          <View style={styles.notificationText}>
            {notification.title && (
              <RNText
                style={[styles.notificationTitle, { color: colors.white }]}
                numberOfLines={1}
              >
                {notification.title}
              </RNText>
            )}
            <RNText
              style={[styles.notificationMessage, { color: colors.white }]}
              numberOfLines={2}
            >
              {notification.message}
            </RNText>
          </View>

          {notification.action && (
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                notification.action?.onPress();
                hide(notification.id);
              }}
            >
              <RNText style={[styles.actionText, { color: getNotificationColor(notification.type) }]}>
                {notification.action.label}
              </RNText>
            </Pressable>
          )}
        </View>

        {/* Progress bar for auto-dismiss */}
        {notification.duration && notification.duration > 0 && (
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />
        )}
      </Pressable>
    );
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Top notifications */}
      {groupedNotifications.top.length > 0 && (
        <SafeAreaView style={styles.topContainer} pointerEvents="box-none">
          <View style={styles.topStack} pointerEvents="box-none">
            {groupedNotifications.top.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))}
          </View>
        </SafeAreaView>
      )}

      {/* Bottom notifications */}
      {groupedNotifications.bottom.length > 0 && (
        <SafeAreaView style={styles.bottomContainer} pointerEvents="box-none">
          <View style={styles.bottomStack} pointerEvents="box-none">
            {groupedNotifications.bottom.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))}
          </View>
        </SafeAreaView>
      )}

      {/* Center notifications (modals) */}
      {groupedNotifications.center.length > 0 && (
        <SafeAreaView style={styles.centerContainer} pointerEvents="box-none">
          <View style={styles.centerStack} pointerEvents="box-none">
            {groupedNotifications.center.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} />
            ))}
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    pointerEvents: 'box-none',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    pointerEvents: 'box-none',
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  topStack: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    pointerEvents: 'box-none',
  },
  bottomStack: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    pointerEvents: 'box-none',
  },
  centerStack: {
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: '80%',
    pointerEvents: 'box-none',
  },
  notificationContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 12,
  },
  notificationIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
});

export default NotificationDisplay;
