'use strict';

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../constants/Colors';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  description?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  containerStyle?: ViewStyle;
}

/**
 * Alert Banner Component
 * 
 * Multi-type alert/notification banner with auto-dismiss, actions, and animations
 * Types: success, error, warning, info
 * 
 * @example
 * <AlertBanner type="success" message="Agendamento realizado!" autoDismiss />
 * <AlertBanner 
 *   type="error" 
 *   message="Erro ao carregar" 
 *   description="Tente novamente"
 *   action={{ label: 'Tentar', onPress: retry }}
 * />
 */
export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  description,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 4000,
  icon,
  action,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(true);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss, autoDismissDelay]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const colorConfig = {
    success: { bg: COLORS.success, text: COLORS.text, icon: '✅' },
    error: { bg: COLORS.error, text: COLORS.text, icon: '❌' },
    warning: { bg: COLORS.warning, text: COLORS.text, icon: '⚠️' },
    info: { bg: COLORS.primary, text: COLORS.white, icon: 'ℹ️' },
  };

  const config = colorConfig[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
        containerStyle,
      ]}
    >
      <View style={[styles.banner, { backgroundColor: config.bg }]}>
        <View style={styles.content}>
          <Text style={styles.icon}>{icon || config.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: config.text }]}>
              {message}
            </Text>
            {description && (
              <Text style={[styles.description, { color: config.text }]} numberOfLines={2}>
                {description}
              </Text>
            )}
          </View>
        </View>

        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              action.onPress();
              handleDismiss();
            }}
          >
            <Text style={[styles.actionText, { color: config.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}

        {!action && (
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Text style={[styles.closeIcon, { color: config.text }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '400',
    marginTop: 2,
    opacity: 0.8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertBanner;
