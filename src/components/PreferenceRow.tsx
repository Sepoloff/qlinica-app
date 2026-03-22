import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { COLORS } from '../constants/Colors';

interface PreferenceRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: string;
}

export const PreferenceRow: React.FC<PreferenceRowProps> = ({
  label,
  description,
  value,
  onValueChange,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.texts}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: `${COLORS.gold}50` }}
        thumbColor={value ? COLORS.gold : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}10`,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  description: {
    fontSize: 11,
    color: COLORS.grey,
    marginTop: 2,
    fontFamily: 'DMSans',
  },
});
