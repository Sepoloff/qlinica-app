'use strict';
import { LinearGradient } from 'expo-linear-gradient';

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { SERVICES } from '../constants/Data';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBookingState } from '../hooks/useBookingState';
import { useApiCache } from '../hooks/useApiCache';
import { useScreenPerformance } from '../hooks/usePerformanceTracking';
import { BookingProgress } from '../components/BookingProgress';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { bookingService, Service } from '../services/bookingService';
import { convertMockServices } from '../utils/mockDataConverters';
import { logger } from '../utils/logger';

export default function ServiceSelectionScreen() {
  const navigation = useNavigation();
  const { setService } = useBooking();
  const { updateService } = useBookingState();
  const { showToast } = useToast();
  const { trackScreenView, trackEvent } = useAnalytics();
  const { getRenderCount } = useScreenPerformance({ screenName: 'ServiceSelectionScreen' });
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | number | null>(null);

  // Use API cache for services with 10-minute TTL
  const { 
    data: services = [], 
    loading, 
    error,
    isCached,
    refetch: refetchServices 
  } = useApiCache(
    '/api/services',
    async () => {
      try {
        const data = await bookingService.getServices().catch(() => {
          logger.warn('Fallback to mock services', undefined);
          return convertMockServices();
        });
        return data || [];
      } catch (err) {
        logger.error('Error loading services', err);
        return convertMockServices();
      }
    },
    { 
      ttl: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        trackEvent('services_loaded', { count: data?.length || 0, cached: isCached });
      },
      onError: (error) => {
        trackEvent('services_load_error', { error: error.message });
      }
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('service_selection', { 
        cached: isCached,
        renderCount: getRenderCount()
      });
      return () => {};
    }, [trackScreenView, isCached, getRenderCount])
  );

  const handleServiceSelect = (service: Service | typeof SERVICES[0]) => {
    try {
      // Validate service data
      if (!service?.id || !service?.name) {
        throw new Error('Dados de serviço inválidos');
      }

      logger.debug(`Service selected: ${service.id} - ${service.name}`);
      
      setSelectedServiceId(service.id);
      setService(service as any);
      updateService(String(service.id), service.name, (service as any).price || 0);
      
      showToast(`${service.name} selecionado com sucesso`, 'success');

      trackEvent('service_selected', { 
        serviceId: service.id,
        serviceName: service.name,
        price: (service as any).price || 0,
      });

      // Navigate with slight delay for smooth transition
      setTimeout(() => {
        navigation.navigate('TherapistSelection' as never);
      }, 300);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao selecionar serviço';
      logger.error('Error selecting service', err);
      showToast({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
      });
      trackEvent('service_selection_error', { error: errorMessage });
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
          <Text style={styles.headerTitle}>Escolha o Serviço</Text>
          <Text style={styles.headerSubtitle}>Selecione o tipo de terapia desejada</Text>
        </View>
      </LinearGradient>

      {/* Booking Progress */}
      <View style={styles.progressContainer}>
        <BookingProgress currentStep={1} totalSteps={4} />
      </View>

      {/* Services Grid */}
      <View style={styles.servicesContainer}>
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ marginBottom: 16 }}>
                <SkeletonLoader
                  width="100%"
                  height={180}
                  borderRadius={16}
                />
              </View>
            ))}
          </>
        ) : (services.length > 0 ? services : convertMockServices()).map((service) => (
          <TouchableOpacity 
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServiceSelect(service as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.serviceIcon}>{service.icon || '✨'}</Text>
            </View>
            
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc} numberOfLines={2}>{service.description || ''}</Text>
            
            <View style={styles.serviceDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duração</Text>
                <Text style={styles.detailValue}>{`${service.duration}min`}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Preço</Text>
                <Text style={styles.detailValue}>{`€${service.price}`}</Text>
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
