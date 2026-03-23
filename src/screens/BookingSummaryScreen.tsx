'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { useNotificationManager } from '../hooks/useNotificationManager';
import { useBookingAPI } from '../hooks/useBookingAPI';
import { useAnalytics } from '../hooks/useAnalytics';
import { BookingProgress } from '../components/BookingProgress';
import { Button } from '../components/Button';
import { logger } from '../utils/logger';
import { validateCompleteBooking } from '../utils/bookingValidator';

interface Service {
  id: number;
  name: string;
  icon: string;
  price: string;
  duration: string;
}

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  rating: number;
}

export interface BookingSummaryParams {
  service: Service;
  therapist: Therapist;
  date: string;
  time: string;
}

type NavigationProp = any;

export default function BookingSummaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { bookingData, resetBooking } = useBooking();
  const { showToast } = useToast();
  const { notifyBookingConfirmation, notifyReminder } = useNotificationManager();
  const { createBooking } = useBookingAPI();
  const { trackEvent } = useAnalytics();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  
  // Extract params from route or context
  const params = (route.params || bookingData) as Partial<BookingSummaryParams> | undefined;
  const { service, therapist, date, time } = params || {};

  if (!service || !therapist || !date || !time) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Informações de agendamento incompletas</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEditBooking = () => {
    navigation.goBack();
  };

  const validateBookingData = (): { valid: boolean; error?: string } => {
    try {
      // Use comprehensive booking validator
      const validation = validateCompleteBooking({
        serviceId: service?.id,
        serviceName: service?.name,
        therapistId: therapist?.id,
        therapistName: therapist?.name,
        date,
        time,
      });

      if (!validation.valid && validation.errors.length > 0) {
        return { valid: false, error: validation.errors[0] };
      }

      if (!validation.valid && validation.warnings.length > 0) {
        // Log warnings but continue (they're not blocking)
        logger.warn('Booking validation warnings', new Error(validation.warnings.join(', ')));
      }

      return { valid: true };
    } catch (error) {
      logger.error('Error validating booking data', error);
      return { valid: false, error: 'Erro ao validar dados de agendamento' };
    }
  };

  const handleConfirmBooking = async () => {
    // Validate booking data first
    const validation = validateBookingData();
    if (!validation.valid) {
      setConfirmationError(validation.error || 'Dados de agendamento inválidos');
      showToast(validation.error || 'Dados de agendamento inválidos', 'error', 4000);
      logger.warn(`Booking validation failed: ${validation.error}`);
      return;
    }

    setIsConfirming(true);
    setConfirmationError(null);
    
    try {
      logger.debug('Validating and confirming booking', {
        serviceId: service?.id,
        therapistId: therapist?.id,
        date,
        time,
      });
      
      // Submit booking via API
      const booking = await createBooking({
        serviceId: String(service?.id || ''),
        therapistId: String(therapist?.id || ''),
        date,
        time,
      });
      
      // Track successful booking
      trackEvent('booking_created', {
        bookingId: booking.id,
        serviceId: service?.id,
        therapistId: therapist?.id,
        date,
        time,
      });
      
      if (!booking || !booking.id) {
        throw new Error('Resposta inválida do servidor');
      }

      logger.debug(`Booking created successfully: ${booking.id}`);

      // Parse date and time to create appointment datetime
      // Assuming date is in format "DD/MM/YYYY" and time is "HH:MM"
      let appointmentDate: Date;
      try {
        const [day, month, year] = date.split('/');
        const [hours, minutes] = time.split(':');
        appointmentDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );
      } catch (dateParseError) {
        logger.warn('Failed to parse appointment date', dateParseError as Error);
        appointmentDate = new Date();
      }

      // Send booking confirmation notification (non-blocking)
      notifyBookingConfirmation(therapist.name, service.name, appointmentDate)
        .catch((notificationError) => {
          logger.warn('Notification send failed (non-critical)', notificationError as Error);
        });

      // Schedule appointment reminder (non-blocking)
      notifyReminder(therapist.name, service.name, appointmentDate)
        .catch((reminderError: any) => {
          logger.warn('Reminder schedule failed (non-critical)', reminderError as Error);
        });

      // Reset booking context
      resetBooking();

      // Show success toast
      showToast('Consulta agendada com sucesso!', 'success', 3000);

      logger.info(`Booking flow completed successfully. Booking ID: ${booking.id}`);

      // Navigate back to main tabs, then to Bookings
      setTimeout(() => {
        navigation.navigate('MainTabs', {
          screen: 'Bookings',
        } as any);
      }, 1000);
    } catch (error: any) {
      logger.error('Error confirming booking', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Falha ao agendar consulta. Verifique sua conexão e tente novamente.';
      
      if (error?.response?.status === 409) {
        errorMessage = 'Este horário não está mais disponível. Selecione outro.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Dados de agendamento inválidos. Tente novamente.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Erro no servidor. Tente mais tarde.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setConfirmationError(errorMessage);
      showToast(errorMessage, 'error', 4000);
      setIsConfirming(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Resumo do Agendamento</Text>
          <Text style={styles.headerSubtitle}>Verifique todos os detalhes antes de confirmar</Text>
        </View>
      </LinearGradient>

      {/* Success Icon */}
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.successMessage}>Pronto para confirmar!</Text>
      </View>

      {/* Booking Progress */}
      <View style={styles.progressContainer}>
        <BookingProgress currentStep={4} totalSteps={4} />
      </View>

      {/* Service Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviço</Text>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{service.name}</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Duração:</Text>
                <Text style={styles.cardValue}>{service.duration} min</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Preço:</Text>
                <Text style={styles.cardValue}>€{service.price}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Therapist Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terapeuta</Text>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.therapistAvatar}>
              <Text style={styles.avatarText}>
                {therapist.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{therapist.name}</Text>
              <Text style={styles.cardSubtitle}>{therapist.specialty}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStars}>★★★★★</Text>
                <Text style={styles.ratingText}>{therapist.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* DateTime Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data e Hora</Text>
        <View style={styles.card}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Data</Text>
              <Text style={styles.dateTimeValue}>{date}</Text>
            </View>
            <View style={styles.dateTimeDivider} />
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Hora</Text>
              <Text style={styles.dateTimeValue}>{time}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Important Notes */}
      <View style={styles.section}>
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>⚠️ Informações Importantes</Text>
          <Text style={styles.notesText}>
            • Confirme sua presença 30 minutos antes da consulta{'\n'}
            • Chegue 10 minutos antes da hora agendada{'\n'}
            • Pode cancelar ou remarcar até 24 horas antes{'\n'}
            • Confirmaremos por email e SMS
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <Button
          label="Editar Detalhes"
          onPress={handleEditBooking}
          disabled={isConfirming}
          variant="secondary"
          size="medium"
          style={{ flex: 1 }}
        />

        <Button
          label={isConfirming ? 'Confirmando...' : 'Confirmar Agendamento'}
          onPress={handleConfirmBooking}
          disabled={isConfirming}
          loading={isConfirming}
          variant="primary"
          size="medium"
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Cormorant',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successIconText: {
    fontSize: 40,
    color: COLORS.gold,
    fontWeight: '700',
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: 12,
    marginBottom: 4,
  },
  therapistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingStars: {
    fontSize: 12,
    color: COLORS.gold,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dateTimeItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateTimeLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  dateTimeDivider: {
    width: 1,
    height: 50,
    backgroundColor: `${COLORS.gold}20`,
  },
  notesCard: {
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },

  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: 'DMSans',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
});
