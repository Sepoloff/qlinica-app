'use strict';

/**
 * StatusBadge Component
 * Displays booking or operation status with appropriate styling
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

export type StatusType = 
  | 'upcoming' 
  | 'confirmed' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'past'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const STATUS_CONFIG: Record<StatusType, { icon: string; bgColor: string; textColor: string; label: string }> = {
  upcoming: {
    icon: '📅',
    bgColor: '#e3f2fd',
    textColor: '#1976d2',
    label: 'Próxima',
  },
  confirmed: {
    icon: '✅',
    bgColor: '#e8f5e9',
    textColor: '#388e3c',
    label: 'Confirmada',
  },
  pending: {
    icon: '⏳',
    bgColor: '#fff3e0',
    textColor: '#f57c00',
    label: 'Pendente',
  },
  completed: {
    icon: '✨',
    bgColor: '#f3e5f5',
    textColor: '#7b1fa2',
    label: 'Concluída',
  },
  cancelled: {
    icon: '❌',
    bgColor: '#ffebee',
    textColor: '#c62828',
    label: 'Cancelada',
  },
  past: {
    icon: '📝',
    bgColor: '#f5f5f5',
    textColor: '#616161',
    label: 'Passada',
  },
  success: {
    icon: '✓',
    bgColor: '#e8f5e9',
    textColor: '#388e3c',
    label: 'Sucesso',
  },
  error: {
    icon: '✕',
    bgColor: '#ffebee',
    textColor: '#c62828',
    label: 'Erro',
  },
  warning: {
    icon: '⚠️',
    bgColor: '#fff3e0',
    textColor: '#e65100',
    label: 'Aviso',
  },
  info: {
    icon: 'ⓘ',
    bgColor: '#e3f2fd',
    textColor: '#1565c0',
    label: 'Informação',
  },
};

const SIZES = {
  small: { fontSize: 11, paddingVertical: 4, paddingHorizontal: 8, iconSize: 12 },
  medium: { fontSize: 12, paddingVertical: 6, paddingHorizontal: 12, iconSize: 14 },
  large: { fontSize: 13, paddingVertical: 8, paddingHorizontal: 14, iconSize: 16 },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZES[size];

  const displayLabel = label || config.label;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.fontSize + 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: config.textColor,
            fontSize: sizeConfig.fontSize,
          },
          textStyle,
        ]}
      >
        {config.icon} {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
  },
  badgeText: {
    fontWeight: '600',
  },
});
