import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

type StatusType = 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'available' | 'unavailable';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

const STATUS_CONFIG: Record<
  StatusType,
  { backgroundColor: string; textColor: string; defaultLabel: string }
> = {
  confirmed: {
    backgroundColor: `${COLORS.success}25`,
    textColor: COLORS.success,
    defaultLabel: 'Confirmada',
  },
  completed: {
    backgroundColor: `${COLORS.info}25`,
    textColor: COLORS.info,
    defaultLabel: 'Concluída',
  },
  cancelled: {
    backgroundColor: `${COLORS.danger}25`,
    textColor: COLORS.danger,
    defaultLabel: 'Cancelada',
  },
  pending: {
    backgroundColor: `${COLORS.gold}25`,
    textColor: COLORS.gold,
    defaultLabel: 'Pendente',
  },
  available: {
    backgroundColor: `${COLORS.success}25`,
    textColor: COLORS.success,
    defaultLabel: 'Disponível',
  },
  unavailable: {
    backgroundColor: `${COLORS.grey}25`,
    textColor: COLORS.grey,
    defaultLabel: 'Indisponível',
  },
};

/**
 * Reusable badge component for status display
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  label,
}) => {
  const config = STATUS_CONFIG[status];
  const displayLabel = label || config.defaultLabel;

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4 },
    medium: { paddingHorizontal: 12, paddingVertical: 6 },
    large: { paddingHorizontal: 16, paddingVertical: 8 },
  };

  const fontSizes = {
    small: 11,
    medium: 12,
    large: 14,
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        sizeStyles[size],
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.textColor, fontSize: fontSizes[size] },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
});
