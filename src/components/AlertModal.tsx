import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  buttons: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onDismiss?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const colors = {
    info: COLORS.gold,
    success: '#4CAF50',
    warning: '#FFA500',
    error: COLORS.danger,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={[styles.icon, { color: colors[type] }]}>
            {icons[type]}
          </Text>

          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.variant === 'primary' && styles.buttonPrimary,
                  button.variant === 'secondary' && styles.buttonSecondary,
                  button.variant === 'danger' && styles.buttonDanger,
                ]}
                onPress={() => {
                  button.onPress();
                  onDismiss?.();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.variant === 'primary' && styles.buttonTextPrimary,
                  ]}
                >
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: '80%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.gold,
  },
  buttonSecondary: {
    backgroundColor: `${COLORS.gold}20`,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  buttonDanger: {
    backgroundColor: `${COLORS.danger}20`,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  buttonTextPrimary: {
    color: COLORS.primaryDark,
  },
});
