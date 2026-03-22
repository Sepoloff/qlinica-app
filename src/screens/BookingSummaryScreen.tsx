'use strict';

import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  LinearGradient,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';

export interface BookingSummaryParams {
  service: {
    id: number;
    name: string;
    icon: string;
    price: string;
    duration: string;
  };
  therapist: {
    id: number;
    name: string;
    specialty: string;
    rating: number;
  };
  date: string;
  time: string;
}

export default function BookingSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract params from route
  const { service, therapist, date, time } = (route.params || {}) as Partial<BookingSummaryParams>;

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
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleEditBooking}
        >
          <Text style={styles.secondaryButtonText}>Editar Detalhes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            Alert.alert(
              'Agendamento Confirmado',
              'Sua consulta foi agendada com sucesso!\n\nReceberá em breve uma confirmação por email e SMS.',
              [
                {
                  text: 'Ir para Marcações',
                  onPress: () => navigation.navigate('bookings' as never),
                }
              ]
            );
          }}
        >
          <Text style={styles.primaryButtonText}>Confirmar Agendamento</Text>
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
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}30`,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
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
