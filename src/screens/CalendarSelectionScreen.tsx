'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBookingState } from '../hooks/useBookingState';
import { BookingProgress } from '../components/BookingProgress';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { InfoBox } from '../components/InfoBox';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Button } from '../components/Button';
import { logger } from '../utils/logger';
import { bookingService } from '../services/bookingService';
import { 
  getNextBusinessDays, 
  formatDateDDMMYYYY, 
  formatDateISO, 
  getShortDayName,
  getRelativeTimeString
} from '../utils/dateHelpers';

export default function CalendarSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingData, setDateTime, resetBooking } = useBooking();
  const { updateDateTime } = useBookingState();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  
  const isReschedule = (route.params as any)?.isReschedule || false;
  const rescheduleBookingId = (route.params as any)?.bookingId;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('calendar_selection', { 
        therapistId: bookingData.therapist?.id,
        isReschedule,
      });
      return () => {};
    }, [bookingData.therapist, isReschedule, trackScreenView])
  );

  useEffect(() => {
    if (selectedDate && bookingData.therapist?.id) {
      loadAvailableTimes();
    }
  }, [selectedDate, bookingData.therapist]);

  const loadAvailableTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = formatDateISO(selectedDate!);
      logger.debug(`Loading available slots for date ${formattedDate}`);
      
      const slots = await bookingService.getAvailableSlots(
        String(bookingData.therapist?.id || ''),
        String(bookingData.service?.id || ''),
        formattedDate
      ).catch((err) => {
        logger.warn('Fallback to default slots', err as Error);
        // Fallback to default times if API fails
        return [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        ];
      });
      
      setAvailableTimes(slots || []);
      trackEvent('available_slots_loaded', { count: slots?.length || 0 });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar horários';
      logger.error('Error loading available times', err);
      setError(errorMsg);
      // Use default times as fallback
      setAvailableTimes([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ]);
      trackEvent('available_slots_load_error', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const dates = getNextBusinessDays(14);

  const validateDateTimeSelection = (): { valid: boolean; error?: string } => {
    if (!selectedDate) {
      return { valid: false, error: 'Por favor, selecione uma data' };
    }
    if (!selectedTime) {
      return { valid: false, error: 'Por favor, selecione um horário' };
    }

    // Validate date is not in the past
    const now = new Date();
    if (selectedDate < now) {
      return { valid: false, error: 'A data não pode estar no passado' };
    }

    // Validate time format
    const timeRegex = /^(\d{2}):(\d{2})$/;
    if (!timeRegex.test(selectedTime)) {
      return { valid: false, error: 'Formato de hora inválido' };
    }

    return { valid: true };
  };

  const handleConfirmBooking = async () => {
    setError(null);

    // Validate selection
    const validation = validateDateTimeSelection();
    if (!validation.valid) {
      showToast(validation.error || 'Por favor, selecione data e hora para continuar', 'error');
      trackEvent('booking_confirm_error', { reason: validation.error });
      return;
    }

    if (!user) {
      showToast('Você precisa estar autenticado para fazer um agendamento', 'error');
      trackEvent('booking_confirm_error', { reason: 'not_authenticated' });
      navigation.goBack();
      return;
    }

    setSubmitting(true);
    try {
      logger.debug(`Confirming booking for ${formatDateDDMMYYYY(selectedDate)} at ${selectedTime}`);
      
      const dateStringISO = formatDateISO(selectedDate);
      const dateStringDisplay = formatDateDDMMYYYY(selectedDate);
      updateDateTime(dateStringISO, selectedTime);
      
      trackEvent('booking_datetime_set', { 
        date: dateStringDisplay,
        time: selectedTime,
      });

      if (isReschedule && rescheduleBookingId) {
        // Reschedule existing booking
        await bookingService.rescheduleBooking(
          rescheduleBookingId,
          dateStringISO,
          selectedTime
        );

        Alert.alert(
          'Sucesso!',
          `Sua consulta foi reagendada com sucesso!\n\n${dateStringDisplay} às ${selectedTime}`,
          [
            {
              text: 'Voltar',
              onPress: () => {
                navigation.navigate('bookings' as never);
              },
            },
          ]
        );
      } else {
        // Create new booking
        if (!bookingData.service || !bookingData.therapist) {
          Alert.alert('Erro', 'Por favor, selecione serviço e terapeuta');
          return;
        }

        const dateStringISO = formatDateISO(selectedDate);
        const dateStringDisplay = formatDateDDMMYYYY(selectedDate);

        const booking = await bookingService.createBooking({
          serviceId: String(bookingData.service.id),
          therapistId: String(bookingData.therapist.id),
          date: dateStringISO,
          time: selectedTime,
          notes: '',
        });

        setDateTime(dateStringISO, selectedTime);
        resetBooking();
        
        Alert.alert(
          'Sucesso!',
          `Sua consulta foi agendada com sucesso!\n\n${bookingData.service.name}\nCom ${bookingData.therapist.name}\n${dateStringDisplay} às ${selectedTime}`,
          [
            {
              text: 'Ir para Marcações',
              onPress: () => navigation.navigate('bookings' as never),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error processing booking:', error);
      Alert.alert('Erro', 'Falha ao processar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
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
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isReschedule ? 'Reagendar Consulta' : 'Escolha a Data e Hora'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {bookingData.therapist?.name || 'Selecione data e horário'}
          </Text>
        </View>
      </LinearGradient>

      {/* Booking Progress */}
      <View style={styles.progressContainer}>
        <BookingProgress currentStep={3} totalSteps={4} />
      </View>

      {/* Service Summary */}
      {bookingData.service && bookingData.therapist && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Serviço</Text>
            <Text style={styles.summaryValue}>
              {bookingData.service.icon} {bookingData.service.name}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Terapeuta</Text>
            <Text style={styles.summaryValue}>{bookingData.therapist.name}</Text>
          </View>
        </View>
      )}

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecione a Data</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.datesScroll}
          contentContainerStyle={styles.datesContent}
        >
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate && 
                date.toDateString() === selectedDate.toDateString() && 
                styles.dateButtonSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dayName}>{getShortDayName(date)}</Text>
              <Text 
                style={[
                  styles.dateText,
                  selectedDate && 
                  date.toDateString() === selectedDate.toDateString() && 
                  styles.dateTextSelected,
                ]}
              >
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      {selectedDate && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selecione a Hora</Text>
            <Text style={styles.selectedDate}>
              {getDayName(selectedDate)}, {formatDate(selectedDate)}
            </Text>
          </View>

          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <SkeletonLoader
                    width="100%"
                    height={50}
                    borderRadius={12}
                  />
                </View>
              ))}
            </>
          ) : (
            <View style={styles.timesGrid}>
              {availableTimes.length > 0 ? (
                availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      selectedTime === time && styles.timeButtonSelected,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text 
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTimesText}>Sem horários disponíveis para esta data</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          label={submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime || submitting}
          loading={submitting}
          variant="primary"
          size="large"
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
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
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
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: `${COLORS.gold}20`,
    marginVertical: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDate: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  datesScroll: {
    marginHorizontal: -20,
  },
  datesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dateButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
    alignItems: 'center',
    minWidth: 70,
  },
  dateButtonSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  dayName: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  dateTextSelected: {
    color: COLORS.primaryDark,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flex: 0.31,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
  },
  timeButtonSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  timeTextSelected: {
    color: COLORS.primaryDark,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  noTimesText: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
