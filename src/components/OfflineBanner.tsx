'use strict';

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

interface OfflineBannerProps {
  visible: boolean;
  message?: string;
  type?: 'offline' | 'error' | 'warning';
  style?: ViewStyle;
}

const typeStyles = {
  offline: {
    backgroundColor: '#F39C1220',
    borderColor: '#F39C12',
    icon: '📡',
    defaultMessage: 'You are offline. Data will sync when connection is restored.',
  },
  error: {
    backgroundColor: `${COLORS.danger}20`,
    borderColor: COLORS.danger,
    icon: '❌',
    defaultMessage: 'Connection error. Please check your network.',
  },
  warning: {
    backgroundColor: '#FFC10720',
    borderColor: '#FFC107',
    icon: '⚠️',
    defaultMessage: 'Slow connection. Some features may not work properly.',
  },
};

/**
 * Banner for displaying offline/connection status
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  message,
  type = 'offline',
  style,
}) => {
  if (!visible) return null;

  const typeStyle = typeStyles[type];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: typeStyle.backgroundColor,
          borderBottomColor: typeStyle.borderColor,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{typeStyle.icon}</Text>
      <Text style={styles.message}>{message || typeStyle.defaultMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    gap: 10,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '500',
    lineHeight: 16,
  },
});
