import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { COLORS } from '../constants/Colors';

export interface BookingHistoryItem {
  id: string;
  serviceName: string;
  therapistName: string;
  date: Date;
  time: string;
  status: 'completed' | 'cancelled' | 'upcoming' | 'pending';
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  notes?: string;
}

interface BookingHistoryCardProps {
  booking: BookingHistoryItem;
  onPress?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}

const getStatusColor = (status: BookingHistoryItem['status']) => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'upcoming':
      return '#3B82F6';
    case 'cancelled':
      return '#EF4444';
    case 'pending':
      return '#F59E0B';
    default:
      return COLORS.gold;
  }
};

const getStatusText = (status: BookingHistoryItem['status']) => {
  const statusMap = {
    completed: 'Concluído',
    upcoming: 'Próximo',
    cancelled: 'Cancelado',
    pending: 'Pendente',
  };
  return statusMap[status];
};

const getPaymentStatusIcon = (status: BookingHistoryItem['paymentStatus']) => {
  switch (status) {
    case 'paid':
      return '✓';
    case 'pending':
      return '⏳';
    case 'failed':
      return '✕';
  }
};

export const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({
  booking,
  onPress,
  onCancel,
  onReschedule,
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress?.();
  };

  const statusColor = getStatusColor(booking.status);
  const isUpcoming = booking.status === 'upcoming';
  const isCompleted = booking.status === 'completed';

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: animatedScale }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.serviceName}>{booking.serviceName}</Text>
            <Text style={styles.therapistName}>{booking.therapistName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(booking.status)}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>📅 Data</Text>
            <Text style={styles.value}>
              {format(booking.date, 'dd/MM/yyyy', { locale: pt })}
            </Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>🕐 Hora</Text>
            <Text style={styles.value}>{booking.time}</Text>
          </View>
        </View>

        {/* Payment & Notes */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.amountContainer}>
              <Text style={styles.label}>Valor</Text>
              <Text style={styles.amount}>€{booking.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.paymentStatusContainer, styles.alignRight]}>
              <Text style={styles.label}>Pagamento</Text>
              <Text style={styles.paymentStatus}>
                {getPaymentStatusIcon(booking.paymentStatus)} {booking.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
              </Text>
            </View>
          </View>

          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.label}>📝 Notas</Text>
              <Text style={styles.notes} numberOfLines={2}>
                {booking.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {isUpcoming && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rescheduleButton]}
                onPress={onReschedule}
              >
                <Text style={styles.rescheduleButtonText}>Remarcar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
          {isCompleted && (
            <Text style={styles.completedText}>✓ Consulta concluída</Text>
          )}
          {booking.status === 'cancelled' && (
            <Text style={styles.cancelledText}>✕ Cancelado</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  therapistName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  dateTimeItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  paymentStatusContainer: {
    flex: 1,
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  notes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rescheduleButton: {
    backgroundColor: COLORS.gold + '20',
  },
  rescheduleButtonText: {
    color: COLORS.gold,
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: '#EF444420',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  completedText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelledText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
});
