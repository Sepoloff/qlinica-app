'use strict';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  LinearGradient, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

export default function CalendarSelectionScreen() {
  const navigation = useNavigation();
  const { bookingData, setDateTime, resetBooking } = useBooking();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 14 days (excluding Sundays)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates.slice(0, 14);
  };

  useEffect(() => {
    if (selectedDate && bookingData.therapist?.id) {
      loadAvailableTimes();
    }
  }, [selectedDate, bookingData.therapist]);

  const loadAvailableTimes = async () => {
    setLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate!);
      const slots = await bookingService.getAvailableSlots(
        String(bookingData.therapist?.id || ''),
        String(bookingData.service?.id || ''),
        formattedDate
      ).catch(() => {
        // Fallback to default times if API fails
        return [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        ];
      });
      setAvailableTimes(slots || []);
    } catch (error) {
      console.error('Error loading available times:', error);
      // Use default times as fallback
      setAvailableTimes([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dates = generateDates();

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDayName = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return days[date.getDay()];
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingData.service || !bookingData.therapist) {
      Alert.alert('Erro', 'Por favor, selecione data, hora, serviço e terapeuta');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar autenticado para fazer um agendamento');
      navigation.goBack();
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        serviceId: String(bookingData.service.id),
        therapistId: String(bookingData.therapist.id),
        date: formatDateForAPI(selectedDate),
        time: selectedTime,
        notes: '',
      });

      setDateTime(selectedDate, selectedTime);
      resetBooking();
      
      Alert.alert(
        'Sucesso!',
        `Sua consulta foi agendada com sucesso!\n\n${bookingData.service.name}\nCom ${bookingData.therapist.name}\n${formatDate(selectedDate)} às ${selectedTime}`,
        [
          {
            text: 'Ir para Marcações',
            onPress: () => navigation.navigate('bookings' as never),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Erro', 'Falha ao criar agendamento. Tente novamente.');
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
          <Text style={styles.headerTitle}>Escolha a Data e Hora</Text>
          <Text style={styles.headerSubtitle}>
            {bookingData.therapist?.name || 'Selecione data e horário'}
          </Text>
        </View>
      </LinearGradient>

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
              <Text style={styles.dayName}>{getDayName(date)}</Text>
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
            <ActivityIndicator size="large" color={COLORS.gold} style={{ marginVertical: 20 }} />
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
        <TouchableOpacity
          style={[
            styles.continueButton, 
            (!selectedDate || !selectedTime || submitting) && styles.continueButtonDisabled
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.primaryDark} />
          ) : (
            <Text style={styles.continueButtonText}>Confirmar Agendamento</Text>
          )}
        </TouchableOpacity>
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
  continueButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
  },
  noTimesText: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
