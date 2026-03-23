'use strict';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Booking } from '../services/apiService';

interface UpcomingBookingCardProps {
  booking: Booking;
  serviceName?: string;
  therapistName?: string;
  onPress?: () => void;
  onCancel?: () => void;
}

/**
 * Card that displays an upcoming booking with quick actions
 * Shows date, time, service, therapist, and action buttons
 */
export const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({
  booking,
  serviceName = 'Consulta',
  therapistName = 'Terapeuta',
  onPress,
  onCancel,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning || '#FF9500';
      case 'cancelled':
        return COLORS.danger;
      default:
        return COLORS.grey;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: getStatusColor(booking.status) }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusLabel}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Data:</Text>
          <Text style={styles.detailValue}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🕐 Hora:</Text>
          <Text style={styles.detailValue}>{booking.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👤 Terapeuta:</Text>
          <Text style={styles.detailValue}>{therapistName}</Text>
        </View>
      </View>

      {/* Actions */}
      {booking.status === 'confirmed' && onCancel && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.grey}20`,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${COLORS.danger}20`,
  },
  cancelButtonText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
