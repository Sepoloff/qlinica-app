import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LinearGradient, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { BOOKINGS, SERVICES } from '../constants/Data';
import { useAuth } from '../context/AuthContext';
import bookingService, { Booking, Service } from '../services/bookingService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load services
      const servicesData = await bookingService.getServices().catch(() => SERVICES as any);
      setServices(servicesData || SERVICES);

      // Load user bookings if authenticated
      if (user) {
        const bookingsData = await bookingService.getUserBookings().catch(() => BOOKINGS as any);
        setBookings(bookingsData || BOOKINGS);
      } else {
        setBookings(BOOKINGS);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Failed to load data');
      // Fallback to mock data
      setServices(SERVICES as any);
      setBookings(BOOKINGS as any);
    } finally {
      setLoading(false);
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
          onPress={() => navigation.navigate('ServiceSelection' as never)}
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

        {loading && !bookings.length ? (
          <ActivityIndicator size="large" color={COLORS.gold} style={{ marginVertical: 20 }} />
        ) : bookings.filter(b => b.status === 'confirmed').length > 0 ? (
          bookings
            .filter(b => b.status === 'confirmed')
            .slice(0, 3)
            .map((booking) => (
              <View key={booking.id} style={styles.appointmentCard}>
                <Text style={styles.appointmentIcon}>🗓️</Text>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentService}>{booking.serviceId}</Text>
                  <Text style={styles.appointmentTherapist}>{booking.therapistId}</Text>
                  <Text style={styles.appointmentTime}>
                    📅 {booking.date} · 🕐 {booking.time}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma consulta agendada</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('ServiceSelection' as never)}
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
          {(services.length > 0 ? services : SERVICES).map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceSelection' as never)}
            >
              <Text style={styles.serviceIcon}>{'icon' in service ? service.icon : '✨'}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
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
