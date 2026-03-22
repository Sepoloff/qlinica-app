import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Booking } from '../services/bookingService';

interface BookingCardProps {
  booking: Booking;
  serviceName?: string;
  therapistName?: string;
  onReschedule?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => Promise<void>;
  onDetails?: (bookingId: string) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return '#4CAF50';
    case 'completed':
      return COLORS.gold;
    case 'cancelled':
      return '#9E9E9E';
    case 'pending':
      return '#FF9800';
    default:
      return COLORS.grey;
  }
};

const getStatusLabel = (status: Booking['status']) => {
  const labels: Record<Booking['status'], string> = {
    confirmed: 'Confirmada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    pending: 'Pendente',
  };
  return labels[status];
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  serviceName = 'Consulta',
  therapistName = 'Terapeuta',
  onReschedule,
  onCancel,
  onDetails,
  isLoading = false,
}) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Marcação',
      'Tem a certeza que deseja cancelar esta marcação?',
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar Marcação',
          onPress: async () => {
            if (!onCancel) return;
            setCancelling(true);
            try {
              await onCancel(booking.id);
            } finally {
              setCancelling(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const statusColor = getStatusColor(booking.status);
  const isUpcoming = booking.status === 'confirmed';
  const isActionDisabled = isLoading || cancelling;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onDetails?.(booking.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {serviceName}
            </Text>
            <Text style={styles.status}>{getStatusLabel(booking.status)}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Terapeuta:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {therapistName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Data:</Text>
            <Text style={styles.detailValue}>{booking.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Hora:</Text>
            <Text style={styles.detailValue}>{booking.time}</Text>
          </View>

          {booking.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notas:</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {booking.notes}
              </Text>
            </View>
          )}
        </View>

        {isUpcoming && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rescheduleButton, isActionDisabled && styles.actionButtonDisabled]}
              onPress={() => !isActionDisabled && onReschedule?.(booking.id)}
              disabled={isActionDisabled}
            >
              <Text style={styles.actionButtonText}>Remarcar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, isActionDisabled && styles.actionButtonDisabled]}
              onPress={handleCancel}
              disabled={isActionDisabled}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                  Cancelar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBar: {
    height: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.gold}20`,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rescheduleButton: {
    backgroundColor: COLORS.gold,
  },
  cancelButton: {
    backgroundColor: `${COLORS.gold}20`,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
  cancelButtonText: {
    color: COLORS.gold,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});
