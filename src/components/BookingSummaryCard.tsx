/**
 * Booking Summary Card Component
 * Displays complete booking information with easy editing
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { Card } from './Card';

export interface BookingSummaryData {
  service?: {
    id: number | string;
    name: string;
    price: string;
    duration: string;
  };
  therapist?: {
    id: number | string;
    name: string;
    specialty: string;
    rating?: number;
  };
  date?: string;
  time?: string;
  notes?: string;
  total?: string;
}

interface BookingSummaryCardProps {
  data: BookingSummaryData;
  onEditService?: () => void;
  onEditTherapist?: () => void;
  onEditDateTime?: () => void;
  onEditNotes?: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

/**
 * Enhanced Booking Summary Card
 * 
 * Features:
 * - Clear layout of booking information
 * - Edit buttons for each section
 * - Loading states
 * - Price breakdown
 * 
 * @example
 * <BookingSummaryCard
 *   data={bookingData}
 *   onEditService={() => goBack()}
 *   onEditTherapist={() => goBack()}
 * />
 */
export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  data,
  onEditService,
  onEditTherapist,
  onEditDateTime,
  onEditNotes,
  loading = false,
  style,
}) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
    >
      {/* Service Section */}
      {data.service && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Serviço</Text>
            {onEditService && (
              <TouchableOpacity onPress={onEditService}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{data.service.name}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duração:</Text>
              <Text style={styles.value}>{data.service.duration}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Preço:</Text>
              <Text style={[styles.value, styles.price]}>{data.service.price}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Therapist Section */}
      {data.therapist && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👨‍⚕️ Terapeuta</Text>
            {onEditTherapist && (
              <TouchableOpacity onPress={onEditTherapist}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{data.therapist.name}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Especialidade:</Text>
              <Text style={styles.value}>{data.therapist.specialty}</Text>
            </View>
            {data.therapist.rating && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Avaliação:</Text>
                <Text style={styles.value}>⭐ {data.therapist.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Date & Time Section */}
      {(data.date || data.time) && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Data e Hora</Text>
            {onEditDateTime && (
              <TouchableOpacity onPress={onEditDateTime}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>
            {data.date && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Data:</Text>
                <Text style={styles.value}>{data.date}</Text>
              </View>
            )}
            {data.time && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Hora:</Text>
                <Text style={styles.value}>{data.time}</Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Notes Section */}
      {data.notes && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Notas</Text>
            {onEditNotes && (
              <TouchableOpacity onPress={onEditNotes}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.notesText}>{data.notes}</Text>
        </Card>
      )}

      {/* Total Section */}
      {data.total && (
        <Card style={[styles.section, styles.totalSection]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalPrice}>{data.total}</Text>
          </View>
        </Card>
      )}

      {/* Summary Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusIcon}>✓</Text>
        </View>
        <Text style={styles.statusText}>
          Agendamento completo e pronto para confirmação
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  section: {
    marginHorizontal: 0,
    marginVertical: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'DMSans',
  },
  editButton: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  content: {
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'DMSans',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  price: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'DMSans',
    lineHeight: 20,
  },
  totalSection: {
    backgroundColor: `${COLORS.gold}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'DMSans',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.success,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
});
