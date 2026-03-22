/**
 * NotificationPreferences
 * Component for managing notification settings
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Button } from './Button';
import { Divider } from './Divider';
import { TextInput as TextField } from './TextInput';
import { Badge } from './Badge';
import { useNotifications } from '../context/NotificationContext';

interface NotificationPreferencesProps {
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSave,
  showSaveButton = true,
}) => {
  const { settings, updateSettings, isLoading, error } = useNotifications();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof localSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReminderTimeChange = (value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setLocalSettings((prev) => ({
        ...prev,
        reminderTime: minutes,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(localSettings);
      onSave?.();
    } catch (err) {
      console.error('Error saving notification settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let result = `${hours} hora${hours !== 1 ? 's' : ''}`;
    if (mins > 0) result += ` e ${mins} minuto${mins !== 1 ? 's' : ''}`;
    return result;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Importante" variant="warning" size="small" />
          </View>
          <Checkbox
            label="Ativar Notificações"
            checked={localSettings.enabled}
            onPress={() => handleToggle('enabled')}
            style={styles.checkbox}
          />
          <Divider style={styles.divider} />
        </View>

        {/* Booking Notifications */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Agendamentos" variant="info" size="small" />
          </View>

          <Checkbox
            label="Confirmação de Agendamento"
            checked={localSettings.bookingConfirmation}
            onPress={() => handleToggle('bookingConfirmation')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />
          <Divider style={styles.divider} />
        </View>

        {/* Appointment Reminders */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Lembretes" variant="success" size="small" />
          </View>

          <Checkbox
            label="Lembretes de Consultas"
            checked={localSettings.appointmentReminders}
            onPress={() => handleToggle('appointmentReminders')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />

          {localSettings.appointmentReminders && (
            <>
              <View style={styles.reminderTimeSection}>
                <TextField
                  label="Tempo de Aviso (minutos)"
                  keyboardType="number-pad"
                  value={localSettings.reminderTime.toString()}
                  onChangeText={handleReminderTimeChange}
                  editable={!isLoading}
                  maxLength={4}
                />
                <View style={styles.reminderHint}>
                  <Badge
                    label={`Aviso: ${formatMinutes(localSettings.reminderTime)} antes`}
                    variant="info"
                    size="small"
                  />
                </View>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
        </View>

        {/* Cancellation & Reschedule */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Alterações" variant="danger" size="small" />
          </View>

          <Checkbox
            label="Notificações de Cancelamento"
            checked={localSettings.cancellationNotices}
            onPress={() => handleToggle('cancellationNotices')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />

          <Checkbox
            label="Notificações de Remarcação"
            checked={localSettings.rescheduling}
            onPress={() => handleToggle('rescheduling')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />
          <Divider style={styles.divider} />
        </View>

        {/* Payment & Reviews */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Outros" variant="primary" size="small" />
          </View>

          <Checkbox
            label="Notificações de Pagamento"
            checked={localSettings.paymentNotifications}
            onPress={() => handleToggle('paymentNotifications')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />

          <Checkbox
            label="Pedidos de Avaliação"
            checked={localSettings.reviewRequests}
            onPress={() => handleToggle('reviewRequests')}
            disabled={!localSettings.enabled}
            style={styles.checkbox}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorMessage}>
            <Badge label={`Erro: ${error}`} variant="danger" size="small" />
          </View>
        )}
      </Card>

      {/* Save Button */}
      {showSaveButton && (
        <Button
          title={isSaving ? 'Guardando...' : 'Guardar Preferências'}
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving || isLoading}
          variant="primary"
          size="large"
          style={styles.saveButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  card: {
    margin: 16,
    marginTop: 12,
  },
  section: {
    marginVertical: 12,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  checkbox: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  reminderTimeSection: {
    marginTop: 16,
    marginLeft: 0,
    backgroundColor: `${COLORS.primary}08`,
    padding: 12,
    borderRadius: 8,
  },
  reminderHint: {
    marginTop: 8,
  },
  errorMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 8,
  },
  saveButton: {
    margin: 16,
  },
});

export default NotificationPreferences;
