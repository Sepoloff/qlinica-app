'use strict';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export interface BookingProgressIndicatorProps {
  currentStep: number; // 1-4
  totalSteps?: number;
  labels?: string[];
}

const DEFAULT_LABELS = [
  'Serviço',
  'Terapeuta',
  'Data & Hora',
  'Confirmação',
];

/**
 * Progress indicator for the booking flow
 * Shows which step the user is on (1/4, 2/4, etc)
 * 
 * @example
 * <BookingProgressIndicator 
 *   currentStep={1}
 *   labels={['Serviço', 'Terapeuta', 'Data', 'Confirmação']}
 * />
 */
export const BookingProgressIndicator: React.FC<BookingProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  labels = DEFAULT_LABELS,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%` },
          ]}
        />
      </View>

      {/* Step Counter */}
      <View style={styles.stepCounter}>
        <Text style={styles.stepText}>
          <Text style={styles.currentStep}>{currentStep}</Text>
          <Text style={styles.divider}> / </Text>
          <Text style={styles.totalSteps}>{totalSteps}</Text>
        </Text>
        {labels[currentStep - 1] && (
          <Text style={styles.stepLabel}>{labels[currentStep - 1]}</Text>
        )}
      </View>

      {/* Step Dots (Optional Visual) */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View
              key={stepNumber}
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isCurrent && styles.dotCurrent,
              ]}
            >
              {isCompleted && (
                <Text style={styles.checkMark}>✓</Text>
              )}
              {isCurrent && (
                <Text style={styles.dotNumber}>{stepNumber}</Text>
              )}
              {!isCompleted && !isCurrent && (
                <Text style={styles.dotNumber}>{stepNumber}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gold}20`,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  stepCounter: {
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  currentStep: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  divider: {
    color: COLORS.grey,
  },
  totalSteps: {
    color: COLORS.grey,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.gold}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.gold}30`,
  },
  dotCurrent: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  dotCompleted: {
    backgroundColor: `${COLORS.gold}40`,
    borderColor: COLORS.gold,
  },
  dotNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  checkMark: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default BookingProgressIndicator;
