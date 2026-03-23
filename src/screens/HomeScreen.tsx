import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { BOOKINGS, SERVICES } from '../constants/Data';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useServices } from '../hooks/useDataAPI';
import { useBookingAPI } from '../hooks/useBookingAPI';
import { Service, Booking } from '../services/apiService';
import { convertMockBookings, convertMockServices } from '../utils/mockDataConverters';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { logger } from '../utils/logger';
import { useSafeNavigation } from '../utils/navigationHelper';

export default function HomeScreen() {
  const navigation = useNavigation();
  const safeNav = useSafeNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const { trackScreenView, trackEvent, trackError } = useAnalytics();
  
  // Use API hooks
  const { services = [], isLoading: servicesLoading, error: servicesError, refresh: refreshServices } = useServices();
  const { bookings = [], isLoading: bookingsLoading, error: bookingsError, fetchBookings } = useBookingAPI();
  
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Combined loading state
  const isLoading = authLoading || servicesLoading || bookingsLoading;

  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('home', { userId: user?.id });
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [user, trackScreenView])
  );

  const loadData = async () => {
    try {
      setError(null);
      
      // Load services
      await refreshServices();
      logger.debug('Services loaded successfully');

      // Load bookings if authenticated
      if (user) {
        try {
          await fetchBookings();
          logger.debug('Bookings loaded successfully');
        } catch (err) {
          logger.warn('Failed to fetch bookings, using fallback', err as Error);
          // Fallback to mock data
        }
      }

      trackEvent('home_data_loaded', { 
        servicesCount: services?.length || 0,
        bookingsCount: bookings?.length || 0,
      });
    } catch (err) {
      console.error('Error loading home data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar dados';
      setError(errorMessage);
      trackError(err instanceof Error ? err : new Error(errorMessage), {
        screen: 'home',
        operation: 'loadData',
      });
      logger.error('Error loading home data', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  const handleBookingNavigation = () => {
    if (!user) {
      trackEvent('booking_auth_required');
      Alert.alert('Autenticação', 'Por favor inicie sessão para agendar uma consulta');
      safeNav.navigate('loginStack');
      return;
    }
    trackEvent('booking_flow_started');
    logger.debug(`Booking flow started for user: ${user.id}`);
    safeNav.navigate('ServiceSelection');
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.gold}
          titleColor={COLORS.gold}
          title="Atualizando..."
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.logo}>
              <Text style={{ color: COLORS.gold }}>Q</Text>linica
            </Text>
            <Text style={styles.subtitle}>Fisioterapia & Bem-estar</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatar}>MC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Olá, <Text style={{ fontWeight: 'bold' }}>{user?.name || 'Maria'}</Text>
          </Text>
          <Text style={styles.subGreeting}>Como podemos ajudá-la hoje?</Text>
        </View>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookingNavigation}
        >
          <Text style={styles.bookButtonText}>Agendar Consulta</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximas consultas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('bookings' as never)}>
            <Text style={styles.seeMore}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !bookings.length ? (
          <>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <SkeletonLoader
                  width="100%"
                  height={90}
                  borderRadius={14}
                />
              </View>
            ))}
          </>
        ) : bookings && bookings.filter(b => b.status === 'confirmed').length > 0 ? (
          bookings
            .filter(b => b.status === 'confirmed')
            .slice(0, 3)
            .map((booking) => {
              // Find service and therapist names from mock data if available
              const mockBooking = BOOKINGS.find(b => String(b.id) === booking.id);
              return (
                <View key={booking.id} style={styles.appointmentCard}>
                  <Text style={styles.appointmentIcon}>🗓️</Text>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentService}>{mockBooking?.service || 'Consulta'}</Text>
                    <Text style={styles.appointmentTherapist}>{mockBooking?.therapist || 'Terapeuta'}</Text>
                    <Text style={styles.appointmentTime}>
                      📅 {booking.date} · 🕐 {booking.time}
                    </Text>
                  </View>
                </View>
              );
            })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma consulta agendada</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleBookingNavigation}
            >
              <Text style={styles.emptyStateButtonText}>Agendar agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Services Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Os nossos serviços</Text>
        <View style={styles.servicesGrid}>
          {isLoading && !services.length ? (
            <>
              <SkeletonLoader width="31%" height={90} borderRadius={14} />
              <SkeletonLoader width="31%" height={90} borderRadius={14} />
              <SkeletonLoader width="31%" height={90} borderRadius={14} />
            </>
          ) : (
            (services && services.length > 0 ? services : convertMockServices()).map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={styles.serviceCard}
                onPress={handleBookingNavigation}
              >
                <Text style={styles.serviceIcon}>✨</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
    fontFamily: 'Cormorant',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.grey,
    letterSpacing: 2,
    marginTop: 2,
    fontFamily: 'DMSans',
    textTransform: 'uppercase',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}40`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    fontFamily: 'DMSans',
  },
  subGreeting: {
    fontSize: 13,
    color: COLORS.grey,
    marginTop: 4,
    fontFamily: 'DMSans',
  },
  bookButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  seeMore: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  appointmentCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  appointmentIcon: {
    fontSize: 20,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.gold}15`,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentService: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  appointmentTherapist: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 3,
    fontFamily: 'DMSans',
  },
  appointmentTime: {
    fontSize: 12,
    color: COLORS.gold,
    marginTop: 4,
    fontFamily: 'DMSans',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${COLORS.gold}15`,
  },
  serviceIcon: {
    fontSize: 26,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 13,
    fontFamily: 'DMSans',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 12,
    fontFamily: 'DMSans',
  },
  emptyStateButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
});
