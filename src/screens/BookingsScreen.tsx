import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { BOOKINGS } from '../constants/Data';
import { useAuth } from '../context/AuthContext';
import { useQuickToast } from '../hooks/useToast';
import { useNotificationManager } from '../hooks/useNotificationManager';
import bookingService, { Booking } from '../services/bookingService';
import { BookingCard } from '../components/BookingCard';
import { SkeletonLoader } from '../components/SkeletonLoader';

export default function BookingsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const toast = useQuickToast();
  const { notifyCancellation, notifyReschedule } = useNotificationManager();
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const tabs = ['Próximas', 'Passadas'];

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [user])
  );

  const loadBookings = async (fromRefresh = false) => {
    if (!fromRefresh) {
      setLoading(true);
    }
    try {
      if (user) {
        const data = await bookingService.getUserBookings().catch(() => BOOKINGS as any);
        setBookings(data || BOOKINGS);
      } else {
        setBookings(BOOKINGS as any);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings(BOOKINGS as any);
    } finally {
      setLoading(false);
      if (fromRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    // Find the booking to get details
    const booking = bookings.find(b => b.id === bookingId);
    
    return new Promise<void>((resolve) => {
      Alert.alert(
        'Cancelar consulta',
        'Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser revertida.',
        [
          { text: 'Manter', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Cancelar Consulta',
            style: 'destructive',
            onPress: async () => {
            setCancelling(bookingId);
            try {
              await bookingService.cancelBooking(bookingId);
              
              // Send cancellation notification
              if (booking) {
                try {
                  const dateTime = new Date(`${booking.date}T${booking.time}`);
                  await notifyCancellation(
                    booking.therapistId || 'Terapeuta',
                    booking.serviceId || 'Serviço',
                    dateTime
                  );
                } catch (notificationError) {
                  console.warn('Cancellation notification failed (non-critical):', notificationError);
                }
              }
              
              toast.success('✅ Consulta cancelada com sucesso');
              await loadBookings();
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              const errorMsg = error.response?.data?.message || 'Falha ao cancelar consulta. Tente novamente.';
              toast.error(`❌ ${errorMsg}`);
            } finally {
              setCancelling(null);
              resolve();
            }
            },
          },
        ]
      );
    });
  };

  const handleRescheduleBooking = (booking: Booking) => {
    (Alert.alert as any)(
      'Reagendar consulta',
      'Deseja reagendar esta consulta para outra data?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reagendar',
          onPress: () => {
            // Navigate to calendar selection with booking context
            // This will require updating BookingContext to handle reschedule mode
            (navigation.navigate as any)('CalendarSelection', { 
              isReschedule: true, 
              bookingId: booking.id,
              therapistId: booking.therapistId,
              serviceId: booking.serviceId
            });
          },
        },
      ]
    );
  };

  const filtered = bookings.filter(b =>
    activeTab === 0 ? b.status === 'confirmed' : b.status !== 'confirmed'
  );

  const statusStyles = {
    confirmed: { bg: `${COLORS.success}25`, color: COLORS.success, label: 'Confirmada' },
    completed: { bg: `${COLORS.grey}25`, color: COLORS.grey, label: 'Concluída' },
    cancelled: { bg: `${COLORS.danger}25`, color: COLORS.danger, label: 'Cancelada' },
    pending: { bg: `#FFB84D25`, color: '#FFB84D', label: 'Pendente' },
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>As minhas marcações</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveTab(i)}
            style={[
              styles.tab,
              activeTab === i && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === i && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <View style={styles.bookingsList}>
        {loading ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <SkeletonLoader
                  width="100%"
                  height={100}
                  borderRadius={14}
                />
              </View>
            ))}
          </>
        ) : filtered.length > 0 ? (
          filtered.map((booking) => {
            const mockBooking = BOOKINGS.find(b => String(b.id) === booking.id);
            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                serviceName={mockBooking?.service || 'Consulta'}
                therapistName={mockBooking?.therapist || 'Terapeuta'}
                onReschedule={() => handleRescheduleBooking(booking)}
                onCancel={handleCancelBooking}
                onDetails={() => {
                  (navigation.navigate as any)('BookingDetails', {
                    bookingId: booking.id,
                  });
                }}
                isLoading={cancelling === booking.id}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeTab === 0 ? 'Sem consultas agendadas' : 'Sem histórico de consultas'}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: COLORS.primaryDark,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 0,
    marginHorizontal: 20,
    marginVertical: 24,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: 'relative',
  },
  bookingItem: {
    position: 'relative',
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: -18,
    top: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  bookingCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'DMSans',
    letterSpacing: 0.3,
  },
  bookingTherapist: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionReschedule: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.gold}40`,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  actionCancel: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: `${COLORS.danger}08`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.danger}25`,
    alignItems: 'center',
  },
  actionCancelText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.danger,
    fontFamily: 'DMSans',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
});
