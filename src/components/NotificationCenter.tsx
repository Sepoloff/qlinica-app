import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  isRead: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onAction?: (notificationId: string) => void;
  maxHeight?: number;
}

const getTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return Colors.gold;
  }
};

const getTypeIcon = (type: Notification['type']) => {
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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onAction?: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onAction,
}) => {
  const animatedOpacity = React.useRef(new Animated.Value(1)).current;
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.(notification.id);
    });
  };

  const typeColor = getTypeColor(notification.type);
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          opacity: animatedOpacity,
          transform: [{ scale: animatedScale }],
        },
      ]}
    >
      <View style={[styles.notificationLeft, { borderLeftColor: typeColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
          <Text style={[styles.icon, { color: typeColor }]}>
            {getTypeIcon(notification.type)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => onMarkAsRead?.(notification.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.timestamp}>{timeAgo}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {notification.action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: typeColor }]}
            onPress={() => {
              notification.action?.onPress();
              onAction?.(notification.id);
            }}
          >
            <Text style={[styles.actionText, { color: typeColor }]}>
              {notification.action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onAction,
  maxHeight = 400,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>Sem notificações</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      <ScrollView
        style={[styles.scrollContainer, { maxHeight }]}
        scrollEnabled={notifications.length > 3}
        showsVerticalScrollIndicator
      >
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Helper function to format time
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'a atrás';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mês atrás';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd atrás';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h atrás';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'min atrás';

  return Math.floor(seconds) + 's atrás';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  badge: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContainer: {
    borderRadius: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    paddingLeft: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dismissButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
