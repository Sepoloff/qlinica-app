'use strict';

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LinearGradient } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { THERAPISTS } from '../constants/Data';
import { useBooking } from '../context/BookingContext';

export default function TherapistSelectionScreen() {
  const navigation = useNavigation();
  const { bookingData, setTherapist } = useBooking();
  const [selectedTherapist, setSelectedTherapist] = React.useState<number | null>(null);

  const handleTherapistSelect = (therapist: typeof THERAPISTS[0]) => {
    setSelectedTherapist(therapist.id);
    setTherapist(therapist);
  };

  const handleContinue = () => {
    if (selectedTherapist) {
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

      {/* Therapists List */}
      <View style={styles.therapistsContainer}>
        {THERAPISTS.map((therapist) => (
          <TouchableOpacity
            key={therapist.id}
            style={[
              styles.therapistCard,
              selectedTherapist === therapist.id && styles.therapistCardSelected,
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
                <Text style={styles.reviews}>({therapist.reviews} avaliações)</Text>
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
            {selectedTherapist === therapist.id && (
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
