import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { getPasswordStrength } from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
  style?: any;
}

/**
 * Visual indicator for password strength
 * Shows a progress bar and descriptive text
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showLabel = true,
  style,
}) => {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const widthPercentage = (strength.score / 5) * 100;

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak':
        return COLORS.danger;
      case 'medium':
        return '#FFB84D';
      case 'strong':
        return '#4CAF50';
      default:
        return COLORS.grey;
    }
  };

  const getStrengthLabel = () => {
    switch (strength.strength) {
      case 'weak':
        return 'Fraca';
      case 'medium':
        return 'Média';
      case 'strong':
        return 'Forte';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: `${widthPercentage}%`,
              backgroundColor: getStrengthColor(),
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: getStrengthColor(),
            },
          ]}
        >
          Força: {getStrengthLabel()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 12,
  },
  barContainer: {
    height: 4,
    backgroundColor: '#34495E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
});
