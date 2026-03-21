import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function ProfileScreen() {
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>O meu perfil</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>MC</Text>
        </View>
        <Text style={styles.userName}>Maria Costa</Text>
        <Text style={styles.userContact}>maria.costa@email.pt · +351 912 345 678</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dados Pessoais</Text>
        <View style={styles.card}>
          {[
            { label: 'Nome', value: 'Maria Costa' },
            { label: 'Contacto', value: '+351 912 345 678' },
            { label: 'Email', value: 'maria.costa@email.pt' },
            { label: 'Emergência', value: '+351 918 765 432' },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.infoItem,
                i < 3 && styles.infoItemBorder,
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
          {[
            { label: 'SMS', value: notifSms, setValue: setNotifSms },
            { label: 'Email', value: notifEmail, setValue: setNotifEmail },
            { label: 'Push', value: notifPush, setValue: setNotifPush },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.notifItem,
                i < 2 && styles.notifItemBorder,
              ]}
            >
              <Text style={styles.notifLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setValue}
                trackColor={{ false: COLORS.primaryLight, true: COLORS.gold }}
                thumbColor={item.value ? COLORS.white : COLORS.grey}
              />
            </View>
          ))}
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
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Terminar sessão</Text>
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
