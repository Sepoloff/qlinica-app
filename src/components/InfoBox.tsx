import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

type InfoBoxType = 'info' | 'success' | 'warning' | 'danger';

interface InfoBoxProps {
  type: InfoBoxType;
  title: string;
  message?: string;
  icon?: string;
}

const TYPE_CONFIG: Record<InfoBoxType, { backgroundColor: string; textColor: string; borderColor: string }> = {
  info: {
    backgroundColor: `${COLORS.info}15`,
    textColor: COLORS.info,
    borderColor: COLORS.info,
  },
  success: {
    backgroundColor: `${COLORS.success}15`,
    textColor: COLORS.success,
    borderColor: COLORS.success,
  },
  warning: {
    backgroundColor: `${COLORS.warning}15`,
    textColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  danger: {
    backgroundColor: `${COLORS.danger}15`,
    textColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
};

const DEFAULT_ICONS: Record<InfoBoxType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  danger: '❌',
};

/**
 * Informational box component for displaying messages
 */
export const InfoBox: React.FC<InfoBoxProps> = ({
  type,
  title,
  message,
  icon,
}) => {
  const config = TYPE_CONFIG[type];
  const displayIcon = icon || DEFAULT_ICONS[type];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Text style={styles.icon}>{displayIcon}</Text>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.textColor }]}>
          {title}
        </Text>
        {message && (
          <Text style={[styles.message, { color: config.textColor }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    fontFamily: 'DMSans',
    lineHeight: 16,
  },
});
