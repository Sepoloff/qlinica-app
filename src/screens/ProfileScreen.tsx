import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator, TextInput, Modal, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useQuickToast } from '../hooks/useToast';
import { validatePhone, validateEmail } from '../utils/validation';
import { FormInput } from '../components/FormInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const toast = useQuickToast();
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    loadPreferences();
    if (user?.phone) {
      setTempPhone(user.phone);
    }
  }, [user]);

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

  const handleSavePhone = async () => {
    if (!tempPhone) {
      toast.error('Telefone não pode estar vazio');
      return;
    }

    if (!validatePhone(tempPhone)) {
      toast.error('Número inválido (ex: +351 912345678)');
      return;
    }

    setSavingPhone(true);
    try {
      await updateUser({ phone: tempPhone });
      toast.success('✅ Telefone atualizado');
      setEditingPhone(false);
    } catch (error: any) {
      toast.error('Erro ao atualizar');
      setTempPhone(user?.phone || '');
    } finally {
      setSavingPhone(false);
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
  };

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
          <View style={[styles.infoItem, styles.infoItemBorder]}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{user?.name || 'Maria Costa'}</Text>
            </View>
          </View>
          <View style={[styles.infoItem, styles.infoItemBorder]}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contacto</Text>
              <Text style={styles.infoValue}>{user?.phone || '+351 912 345 678'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setTempPhone(user?.phone || '');
                setEditingPhone(true);
              }}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'maria.costa@email.pt'}</Text>
            </View>
          </View>
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

      {/* Edit Phone Modal */}
      <Modal
        visible={editingPhone}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingPhone(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Telefone</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="+351 912 345 678"
              placeholderTextColor={COLORS.grey}
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
              editable={!savingPhone}
            />
            <View style={styles.modalHelp}>
              <Text style={styles.modalHelpText}>
                Formato: +351 9XXXXXXXX ou 9XXXXXXXX
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setEditingPhone(false)}
                disabled={savingPhone}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, savingPhone && styles.modalButtonDisabled]}
                onPress={handleSavePhone}
                disabled={savingPhone}
              >
                {savingPhone ? (
                  <ActivityIndicator color={COLORS.primaryDark} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  infoContent: {
    flex: 1,
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
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.primaryLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.white,
    borderWidth: 2,
    borderColor: `${COLORS.gold}20`,
    fontFamily: 'DMSans',
    fontSize: 14,
    marginBottom: 8,
  },
  modalHelp: {
    marginBottom: 16,
  },
  modalHelpText: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}30`,
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});
