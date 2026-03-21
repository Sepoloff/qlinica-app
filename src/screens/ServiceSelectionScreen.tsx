'use strict';

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LinearGradient } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { SERVICES } from '../constants/Data';
import { useBooking } from '../context/BookingContext';

export default function ServiceSelectionScreen() {
  const navigation = useNavigation();
  const { setService } = useBooking();

  const handleServiceSelect = (service: typeof SERVICES[0]) => {
    setService(service);
    navigation.navigate('TherapistSelection' as never);
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
          <Text style={styles.headerTitle}>Escolha o Serviço</Text>
          <Text style={styles.headerSubtitle}>Selecione o tipo de terapia desejada</Text>
        </View>
      </LinearGradient>

      {/* Services Grid */}
      <View style={styles.servicesContainer}>
        {SERVICES.map((service) => (
          <TouchableOpacity 
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServiceSelect(service)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.serviceIcon}>{service.icon}</Text>
            </View>
            
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc} numberOfLines={2}>{service.desc}</Text>
            
            <View style={styles.serviceDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duração</Text>
                <Text style={styles.detailValue}>{service.duration}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Preço</Text>
                <Text style={styles.detailValue}>{service.price}</Text>
              </View>
            </View>

            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Selecionar</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  servicesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  serviceCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${COLORS.gold}20`,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primaryDark}80`,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: `${COLORS.gold}30`,
  },
  selectButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
});
