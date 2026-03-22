import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await AsyncStorage.getItem('notificationPrefs');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        setNotifSms(parsed.sms ?? true);
        setNotifEmail(parsed.email ?? true);
        setNotifPush(parsed.push ?? false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (sms: boolean, email: boolean, push: boolean) => {
    try {
      await AsyncStorage.setItem('notificationPrefs', JSON.stringify({ sms, email, push }));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleNotifChange = (type: 'sms' | 'email' | 'push', value: boolean) => {
    if (type === 'sms') {
      setNotifSms(value);
      savePreferences(value, notifEmail, notifPush);
    } else if (type === 'email') {
      setNotifEmail(value);
      savePreferences(notifSms, value, notifPush);
    } else {
      setNotifPush(value);
      savePreferences(notifSms, notifEmail, value);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Terminar sessão',
      'Tem a certeza que deseja terminar a sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao terminar sessão');
              setLoggingOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>O meu perfil</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'MC'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Maria Costa'}</Text>
        <Text style={styles.userContact}>{user?.email || 'maria.costa@email.pt'} · {user?.phone || '+351 912 345 678'}</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dados Pessoais</Text>
        <View style={styles.card}>
          {[
            { label: 'Nome', value: user?.name || 'Maria Costa' },
            { label: 'Contacto', value: user?.phone || '+351 912 345 678' },
            { label: 'Email', value: user?.email || 'maria.costa@email.pt' },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.infoItem,
                i < 2 && styles.infoItemBorder,
              ]}
            >
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notificações</Text>
        <View style={styles.card}>
          <View style={styles.notifItem}>
            <Text style={styles.notifLabel}>SMS</Text>
            <Switch
              value={notifSms}
              onValueChange={(value) => handleNotifChange('sms', value)}
              trackColor={{ false: COLORS.primaryLight, true: COLORS.gold }}
              thumbColor={notifSms ? COLORS.white : COLORS.grey}
            />
          </View>
          <View style={[styles.notifItem, styles.notifItemBorder]}>
            <Text style={styles.notifLabel}>Email</Text>
            <Switch
              value={notifEmail}
              onValueChange={(value) => handleNotifChange('email', value)}
              trackColor={{ false: COLORS.primaryLight, true: COLORS.gold }}
              thumbColor={notifEmail ? COLORS.white : COLORS.grey}
            />
          </View>
          <View style={[styles.notifItem, styles.notifItemBorder]}>
            <Text style={styles.notifLabel}>Push</Text>
            <Switch
              value={notifPush}
              onValueChange={(value) => handleNotifChange('push', value)}
              trackColor={{ false: COLORS.primaryLight, true: COLORS.gold }}
              thumbColor={notifPush ? COLORS.white : COLORS.grey}
            />
          </View>
        </View>
      </View>

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Histórico</Text>
        <View style={styles.historyGrid}>
          {[
            { num: '12', label: 'Consultas' },
            { num: '3', label: 'Terapeutas' },
            { num: '6', label: 'Meses' },
          ].map((s, i) => (
            <View key={i} style={styles.historyItem}>
              <Text style={styles.historyNumber}>{s.num}</Text>
              <Text style={styles.historyLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.danger} />
          ) : (
            <Text style={styles.logoutText}>Terminar sessão</Text>
          )}
        </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.gold}25`,
    borderWidth: 3,
    borderColor: `${COLORS.gold}50`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  userContact: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 4,
    fontFamily: 'DMSans',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}08`,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '500',
    fontFamily: 'DMSans',
  },
  notifItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  notifItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}08`,
  },
  notifLabel: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '500',
    fontFamily: 'DMSans',
  },
  historyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  historyItem: {
    flex: 1,
    backgroundColor: `${COLORS.gold}08`,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  historyNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  historyLabel: {
    fontSize: 10,
    color: COLORS.grey,
    marginTop: 4,
    fontFamily: 'DMSans',
  },
  logoutButton: {
    backgroundColor: `${COLORS.danger}08`,
    borderWidth: 1,
    borderColor: `${COLORS.danger}20`,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
    fontFamily: 'DMSans',
  },
});
