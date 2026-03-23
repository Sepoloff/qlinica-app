'use strict';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const DEFAULT_STEPS = ['Serviço', 'Terapeuta', 'Data/Hora', 'Confirmação'];

/**
 * Booking progress indicator component
 * Shows current step in the booking flow
 */
export const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels = DEFAULT_STEPS,
}) => {
  const steps = stepLabels.slice(0, totalSteps);
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {steps.map((label, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    index < currentStep
                      ? COLORS.success
                      : index === currentStep - 1
                      ? COLORS.gold
                      : COLORS.grey,
                },
              ]}
            >
              {index < currentStep ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color:
                    index <= currentStep - 1 ? COLORS.gold : COLORS.darkGrey,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Current Step Text */}
      <Text style={styles.currentStepText}>
        Passo {currentStep} de {totalSteps}: {steps[currentStep - 1]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentStepText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.darkGrey,
    fontWeight: '500',
  },
});
