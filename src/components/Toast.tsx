import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const translateY = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onClose?.());
    }, duration);

    return () => clearTimeout(timer);
  }, [translateY, duration, onClose]);

  const colors = {
    success: { bg: '#4CAF50', icon: '✅' },
    error: { bg: '#E74C3C', icon: '❌' },
    warning: { bg: '#FFA500', icon: '⚠️' },
    info: { bg: COLORS.gold, icon: 'ℹ️' },
  };

  const config = colors[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { backgroundColor: config.bg }]}
        onPress={onClose}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
});
