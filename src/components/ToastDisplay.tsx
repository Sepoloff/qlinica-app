'use strict';

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/Colors';
import { useToast, Toast, ToastType } from '../context/ToastContext';

const TOAST_HEIGHT = 56;
const ANIMATION_DURATION = 300;

const getToastStyles = (type: ToastType) => {
  const styles = {
    success: {
      backgroundColor: `#4CAF5030`,
      borderColor: '#4CAF50',
      textColor: '#4CAF50',
      icon: '✓',
    },
    error: {
      backgroundColor: `#E74C3C30`,
      borderColor: '#E74C3C',
      textColor: '#E74C3C',
      icon: '✕',
    },
    info: {
      backgroundColor: `${COLORS.gold}20`,
      borderColor: COLORS.gold,
      textColor: COLORS.gold,
      icon: 'ℹ',
    },
    warning: {
      backgroundColor: `#FFB84D30`,
      borderColor: '#FFB84D',
      textColor: '#FFB84D',
      icon: '⚠',
    },
  };

  return styles[type];
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [slideAnim] = useState(new Animated.Value(-TOAST_HEIGHT));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -TOAST_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        onRemove(toast.id);
      });
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, slideAnim, onRemove]);

  const toastStyle = getToastStyles(toast.type);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: toastStyle.backgroundColor,
            borderColor: toastStyle.borderColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: toastStyle.textColor }]}>
          {toastStyle.icon}
        </Text>
        <Text
          style={[styles.message, { color: toastStyle.textColor }]}
          numberOfLines={2}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

export const ToastDisplay: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top + 8,
        },
      ]}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toastContainer: {
    marginBottom: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: TOAST_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    lineHeight: 18,
  },
});
