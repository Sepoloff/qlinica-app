/**
 * Visual indicator for booking flow progress
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export interface BookingProgressIndicatorProps {
  currentStep: 'service' | 'therapist' | 'datetime' | 'summary';
  progress?: number; // 0-100
}

export const BookingProgressIndicator: React.FC<BookingProgressIndicatorProps> = ({
  currentStep,
  progress = 0,
}) => {
  const steps = [
    { key: 'service', label: 'Serviço', number: 1 },
    { key: 'therapist', label: 'Terapeuta', number: 2 },
    { key: 'datetime', label: 'Data & Hora', number: 3 },
    { key: 'summary', label: 'Resumo', number: 4 },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(progress, 25)}%` },
            ]}
          />
        </View>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <View key={step.key} style={styles.stepWrapper}>
              {/* Circle */}
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                  isUpcoming && styles.stepCircleUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.stepLabel,
                  (isCompleted || isCurrent) && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    index < currentIndex && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Percentage Text */}
      <View style={styles.percentageContainer}>
        <Text style={styles.percentageText}>{Math.round(progress)}% completo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.gold,
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCircleUpcoming: {
    backgroundColor: `${COLORS.gold}15`,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.grey,
  },
  stepNumberCurrent: {
    color: COLORS.primaryDark,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.grey,
    textAlign: 'center',
    maxWidth: '100%',
  },
  stepLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  connector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: `${COLORS.gold}20`,
  },
  connectorCompleted: {
    backgroundColor: COLORS.gold,
  },
  percentageContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: '500',
  },
});
