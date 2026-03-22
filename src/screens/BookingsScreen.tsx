import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { BOOKINGS } from '../constants/Data';
import { useAuth } from '../context/AuthContext';
import bookingService, { Booking } from '../services/bookingService';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['Próximas', 'Passadas'];

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [user])
  );

  const loadBookings = async () => {
    setLoading(true);
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
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancelar consulta',
      'Tem a certeza que deseja cancelar esta consulta?',
      [
        { text: 'Não', onPress: () => {}, style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId);
              loadBookings();
              Alert.alert('Sucesso', 'Consulta cancelada com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao cancelar consulta');
            }
          },
          style: 'destructive',
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <ActivityIndicator size="large" color={COLORS.gold} style={{ marginVertical: 40 }} />
        ) : filtered.length > 0 ? (
          filtered.map((booking, index) => {
            const st = statusStyles[booking.status as keyof typeof statusStyles] || { bg: `${COLORS.grey}25`, color: COLORS.grey, label: booking.status };
            return (
              <View key={booking.id} style={styles.bookingItem}>
                {/* Timeline dot */}
                <View style={styles.timelineDot} />

                <View style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingService}>{booking.serviceId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusText, { color: st.color }]}>
                        {st.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.bookingTherapist}>{booking.therapistId}</Text>

                  <View style={styles.bookingDetails}>
                    <Text style={styles.detailItem}>📅 {booking.date}</Text>
                    <Text style={styles.detailItem}>🕐 {booking.time}</Text>
                  </View>

                  {booking.status === 'confirmed' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.actionReschedule}>
                        <Text style={styles.actionText}>Remarcar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionCancel}
                        onPress={() => handleCancelBooking(booking.id)}
                      >
                        <Text style={styles.actionCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
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
