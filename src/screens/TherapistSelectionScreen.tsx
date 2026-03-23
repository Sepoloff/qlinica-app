'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { THERAPISTS } from '../constants/Data';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBookingState } from '../hooks/useBookingState';
import { BookingProgress } from '../components/BookingProgress';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { RatingDisplay } from '../components/RatingDisplay';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { bookingService, Therapist } from '../services/bookingService';
import { logger } from '../utils/logger';

export default function TherapistSelectionScreen() {
  const navigation = useNavigation();
  const { bookingData, setTherapist } = useBooking();
  const bookingStateHelper = useBookingState();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  
  const [selectedTherapist, setSelectedTherapist] = React.useState<string | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('therapist_selection', { 
        serviceId: bookingData.service?.id,
      });
      loadTherapists();
      return () => {};
    }, [bookingData.service, trackScreenView])
  );

  const loadTherapists = async () => {
    setLoading(true);
    setError(null);
    try {
      const serviceId = bookingData.service?.id;
      logger.debug(`Loading therapists for service ${serviceId}`);
      
      // Get all therapists (filtering by service happens in component)
      const data = await bookingService.getTherapists().catch(() => THERAPISTS as any);
      
      setTherapists(data || THERAPISTS);
      trackEvent('therapists_loaded', { count: data?.length || 0 });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar terapeutas';
      logger.error('Error loading therapists', err);
      setError(errorMsg);
      setTherapists(THERAPISTS as any);
      trackEvent('therapists_load_error', { error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleTherapistSelect = (therapist: Therapist | typeof THERAPISTS[0]) => {
    try {
      // Validate therapist data and availability
      if (!therapist?.id || !therapist?.name) {
        throw new Error('Dados de terapeuta inválidos');
      }

      if (!(therapist as any).available) {
        showToast({
          type: 'warning',
          title: 'Indisponível',
          message: `${therapist.name} não está disponível neste momento`,
        });
        return;
      }

      logger.debug(`Therapist selected: ${therapist.id} - ${therapist.name}`);
      setSelectedTherapist(String(therapist.id));
      setTherapist(therapist as any);
      bookingStateHelper.updateTherapist(String(therapist.id), therapist.name);
      
      showToast(`${therapist.name} selecionado com sucesso`, 'success');
      
      trackEvent('therapist_selected', { 
        therapistId: therapist.id,
        therapistName: therapist.name,
        rating: (therapist as any).rating,
        available: (therapist as any).available,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao selecionar terapeuta';
      logger.error('Error selecting therapist', err);
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
      });
      trackEvent('therapist_selection_error', { error: errorMessage });
    }
  };

  const handleContinue = () => {
    if (!selectedTherapist) {
      showToast({
        type: 'warning',
        title: 'Seleção Obrigatória',
        message: 'Selecione um terapeuta para continuar',
      });
      trackEvent('therapist_continue_error', { reason: 'no_selection' });
      return;
    }

    const therapist = therapists.find(t => String(t.id) === selectedTherapist);
    if (therapist) {
      showToast({
        type: 'success',
        title: 'Próximo Passo',
        message: `${therapist.name} - selecione a data e hora`,
      });
      trackEvent('therapist_continue_success');
      navigation.navigate('CalendarSelection' as never);
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
          <Text style={styles.headerTitle}>Escolha o Terapeuta</Text>
          <Text style={styles.headerSubtitle}>
            {bookingData.service?.name || 'Selecione um terapeuta disponível'}
          </Text>
        </View>
      </LinearGradient>

      {/* Booking Progress */}
      <View style={styles.progressContainer}>
        <BookingProgress currentStep={2} totalSteps={4} />
      </View>

      {/* Therapists List */}
      <View style={styles.therapistsContainer}>
        {loading ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <SkeletonLoader
                  width="100%"
                  height={110}
                  borderRadius={14}
                />
              </View>
            ))}
          </>
        ) : (therapists.length > 0 ? therapists : THERAPISTS).map((therapist) => (
          <TouchableOpacity
            key={therapist.id}
            style={[
              styles.therapistCard,
              String(selectedTherapist) === String(therapist.id) && styles.therapistCardSelected,
            ]}
            onPress={() => handleTherapistSelect(therapist)}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View 
              style={[
                styles.avatar,
                selectedTherapist === therapist.id && styles.avatarSelected,
              ]}
            >
              <Text style={styles.avatarText}>{therapist.avatar}</Text>
            </View>

            {/* Info */}
            <View style={styles.therapistInfo}>
              <Text style={styles.therapistName}>{therapist.name}</Text>
              <Text style={styles.specialty}>{therapist.specialty}</Text>
              
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {therapist.rating}</Text>
                <Text style={styles.reviews}>({therapist.reviews_count} avaliações)</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View 
              style={[
                styles.statusBadge,
                therapist.available ? styles.availableBadge : styles.unavailableBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  therapist.available && styles.statusDotAvailable,
                ]}
              />
              <Text 
                style={[
                  styles.statusText,
                  therapist.available && styles.statusTextAvailable,
                ]}
              >
                {therapist.available ? 'Disponível' : 'Indisponível'}
              </Text>
            </View>

            {/* Selection Indicator */}
            {String(selectedTherapist) === String(therapist.id) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedTherapist && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedTherapist}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  therapistsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  therapistCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
  },
  therapistCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.primaryLight}99`,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${COLORS.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarSelected: {
    backgroundColor: COLORS.gold,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
    marginRight: 4,
  },
  reviews: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  availableBadge: {
    backgroundColor: `#4CAF5020`,
  },
  unavailableBadge: {
    backgroundColor: `#E74C3C20`,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginRight: 5,
  },
  statusDotAvailable: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E74C3C',
    fontFamily: 'DMSans',
  },
  statusTextAvailable: {
    color: '#4CAF50',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
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
});
