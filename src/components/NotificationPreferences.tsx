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

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsReminders: boolean;
  reminderTime: number;
}

interface NotificationPreferencesProps {
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSave,
  showSaveButton = true,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: false,
    smsReminders: true,
    reminderTime: 24, // hours before appointment
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof NotificationSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
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
      // Save settings to local storage or API
      console.log('Notification settings saved:', localSettings);
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
        {/* Push Notifications */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Badge label="Notificações" variant="info" size="small" />
          </View>
          <Checkbox
            label="Notificações Push"
            checked={localSettings.pushNotifications}
            onPress={() => handleToggle('pushNotifications')}
            style={styles.checkbox}
          />
          <Divider style={styles.divider} />
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Checkbox
            label="Notificações por Email"
            checked={localSettings.emailNotifications}
            onPress={() => handleToggle('emailNotifications')}
            style={styles.checkbox}
          />
          <Divider style={styles.divider} />
        </View>

        {/* SMS Reminders */}
        <View style={styles.section}>
          <Checkbox
            label="Lembretes por SMS"
            checked={localSettings.smsReminders}
            onPress={() => handleToggle('smsReminders')}
            style={styles.checkbox}
          />

          {localSettings.smsReminders && (
            <>
              <View style={styles.reminderTimeSection}>
                <TextField
                  label="Tempo de Aviso (horas)"
                  keyboardType="number-pad"
                  value={localSettings.reminderTime.toString()}
                  onChangeText={handleReminderTimeChange}
                  maxLength={3}
                />
                <View style={styles.reminderHint}>
                  <Badge
                    label={`Aviso: ${localSettings.reminderTime} horas antes`}
                    variant="success"
                    size="small"
                  />
                </View>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
        </View>

        {/* Action Buttons */}
        {showSaveButton && (
          <View style={styles.actions}>
            <Button
              title="Guardar Definições"
              onPress={handleSave}
              loading={isSaving}
              variant="primary"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: 16,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  headerRow: {
    marginBottom: 12,
  },
  checkbox: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 12,
  },
  reminderTimeSection: {
    marginVertical: 12,
    paddingLeft: 16,
  },
  reminderHint: {
    marginTop: 8,
  },
  actions: {
    marginTop: 24,
  },
});
