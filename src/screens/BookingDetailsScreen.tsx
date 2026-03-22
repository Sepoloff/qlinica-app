'use strict';

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useQuickToast } from '../hooks/useToast';
import { useNotificationManager } from '../hooks/useNotificationManager';
import bookingService, { Booking, Service, Therapist } from '../services/bookingService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatDate, formatTime } from '../utils/dateHelpers';
import { AlertModal } from '../components/AlertModal';

export default function BookingDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const toast = useQuickToast();
  const { notifyCancellation, notifyReschedule } = useNotificationManager();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [(route.params as any)?.bookingId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load booking
      const bookingData = await bookingService.getBooking((route.params as any)?.bookingId);
      setBooking(bookingData);

      // Load service details
      const serviceData = await bookingService.getService(bookingData.serviceId);
      setService(serviceData);

      // Load therapist details
      const therapistData = await bookingService.getTherapist(bookingData.therapistId);
      setTherapist(therapistData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao carregar detalhes';
      setError(errorMessage);
      console.error('Error loading booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelling(true);

    try {
      await bookingService.cancelBooking(booking.id);

      // Send cancellation notification
      if (therapist) {
        try {
          const dateTime = new Date(`${booking.date}T${booking.time}`);
          await notifyCancellation(
            therapist.name,
            service?.name || 'Serviço',
            dateTime
          );
        } catch (notificationError) {
          console.warn('Cancellation notification failed (non-critical):', notificationError);
        }
      }

      toast.success('✅ Consulta cancelada com sucesso');
      setShowCancelModal(false);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Falha ao cancelar consulta. Tente novamente.';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = () => {
    if (!booking) return;
    // Navigate to calendar selection with booking ID to reschedule
    (navigation.navigate as any)('CalendarSelection', {
      rescheduleBookingId: booking.id,
      serviceId: booking.serviceId,
      therapistId: booking.therapistId,
    });
  };

  const isFuture = booking ? new Date(`${booking.date}T${booking.time}`) > new Date() : false;
  const isCompleted = booking?.status === 'completed';

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Consulta</Text>
        </LinearGradient>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SkeletonLoader />
        </ScrollView>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Consulta</Text>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error || 'Consulta não encontrada'}</Text>
          <Button label="Voltar" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Consulta</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(booking.status)}</Text>
          </View>
        </View>

        {/* Service Card */}
        {service && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{service.icon || '🏥'}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{service.name}</Text>
                <Text style={styles.cardDescription}>{service.description}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardFooter}>
              <Text style={styles.priceLabel}>Preço:</Text>
              <Text style={styles.priceValue}>€{service.price.toFixed(2)}</Text>
            </View>
          </Card>
        )}

        {/* Therapist Card */}
        {therapist && (
          <Card style={styles.card}>
            <View style={styles.therapistHeader}>
              <Text style={styles.therapistAvatar}>{therapist.avatar || '👨‍⚕️'}</Text>
              <View style={styles.therapistContent}>
                <Text style={styles.therapistName}>{therapist.name}</Text>
                <Text style={styles.therapistSpecialty}>{therapist.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {therapist.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewsText}>({therapist.reviews} avaliações)</Text>
                </View>
              </View>
            </View>
            {therapist.phone && (
              <>
                <View style={styles.divider} />
                <Text style={styles.contactInfo}>📞 {therapist.phone}</Text>
              </>
            )}
          </Card>
        )}

        {/* DateTime Card */}
        <Card style={styles.card}>
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Data</Text>
              <Text style={styles.dateTimeValue}>{formatDate(booking.date)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Hora</Text>
              <Text style={styles.dateTimeValue}>{formatTime(booking.time)}</Text>
            </View>
          </View>
          {booking.notes && (
            <>
              <View style={styles.divider} />
              <View>
                <Text style={styles.notesLabel}>📝 Notas</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Duration Info */}
        {service && (
          <Card style={styles.card}>
            <Text style={styles.infoLabel}>⏱️ Duração da Consulta</Text>
            <Text style={styles.infoValue}>{service.duration} minutos</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isFuture && booking.status !== 'cancelled' && (
            <>
              <Button
                label="📅 Remarcar Consulta"
                onPress={handleReschedule}
                variant="secondary"
              />
              <View style={styles.buttonSpacer} />
            </>
          )}

          {isFuture && booking.status !== 'cancelled' && (
            <Button
              label="❌ Cancelar Consulta"
              onPress={() => setShowCancelModal(true)}
              variant="danger"
            />
          )}

          {isCompleted && (
            <Button
              label="📞 Agendar Novo"
              onPress={() => navigation.navigate('ServiceSelection' as never)}
              variant="primary"
            />
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <AlertModal
        visible={showCancelModal}
        type="warning"
        title="Cancelar Consulta"
        message="Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser revertida."
        buttons={[
          {
            label: 'Manter Consulta',
            onPress: () => setShowCancelModal(false),
            variant: 'secondary',
          },
          {
            label: 'Cancelar Consulta',
            onPress: handleCancelBooking,
            variant: 'danger',
          },
        ]}
        onDismiss={() => setShowCancelModal(false)}
      />
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return '#27AE60';
    case 'completed':
      return '#3498DB';
    case 'cancelled':
      return '#E74C3C';
    case 'pending':
    default:
      return '#F39C12';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed':
      return '✅ Confirmada';
    case 'completed':
      return '✔️ Realizada';
    case 'cancelled':
      return '❌ Cancelada';
    case 'pending':
    default:
      return '⏳ Pendente';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.gold,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.gold,
    flex: 1,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#AAA',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#AAA',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  therapistAvatar: {
    fontSize: 44,
    marginRight: 12,
  },
  therapistContent: {
    flex: 1,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  therapistSpecialty: {
    fontSize: 13,
    color: '#AAA',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.gold,
    marginRight: 6,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
  },
  contactInfo: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 4,
  },
  dateTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 6,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  notesLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  buttonSpacer: {
    height: 12,
  },
  spacer: {
    height: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
});
