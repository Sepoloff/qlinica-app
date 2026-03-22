import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

/**
 * Number stepper component for incrementing/decrementing values
 */
export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 1,
  max = 10,
  step = 1,
  onChange,
  size = 'medium',
  disabled = false,
}) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const sizeStyles = {
    small: { button: 28, text: 12, padding: 4 },
    medium: { button: 36, text: 14, padding: 6 },
    large: { button: 44, text: 16, padding: 8 },
  };

  const current = sizeStyles[size];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: current.button,
            height: current.button,
            opacity: canDecrement && !disabled ? 1 : 0.5,
          },
        ]}
        onPress={() => onChange(Math.max(min, value - step))}
        disabled={!canDecrement || disabled}
      >
        <Text style={[styles.buttonText, { fontSize: current.text }]}>−</Text>
      </TouchableOpacity>

      <View style={styles.displayContainer}>
        <Text
          style={[
            styles.displayText,
            { fontSize: current.text + 2, paddingHorizontal: current.padding },
          ]}
        >
          {value}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            width: current.button,
            height: current.button,
            opacity: canIncrement && !disabled ? 1 : 0.5,
          },
        ]}
        onPress={() => onChange(Math.min(max, value + step))}
        disabled={!canIncrement || disabled}
      >
        <Text style={[styles.buttonText, { fontSize: current.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#34495E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontFamily: 'DMSans',
  },
  displayContainer: {
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayText: {
    color: '#E8E8E8',
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
});
