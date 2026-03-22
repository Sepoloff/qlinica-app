import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export interface Step {
  id: string;
  label: string;
  icon?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStepId: string;
  onStepPress?: (stepId: string) => void;
  completedSteps?: string[];
}

/**
 * Visual indicator for multi-step processes
 * Shows progress through numbered steps
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStepId,
  onStepPress,
  completedSteps = [],
}) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <View style={styles.container}>
      {/* Steps */}
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStepId;
          const isUpcoming = index > currentIndex;

          return (
            <View key={step.id} style={styles.stepContainer}>
              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                  isUpcoming && styles.stepCircleUpcoming,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.stepIconCompleted}>✓</Text>
                ) : isCurrent ? (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.stepLabel,
                  (isCurrent || isCompleted) && styles.stepLabelActive,
                ]}
                numberOfLines={2}
              >
                {step.label}
              </Text>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    (isCompleted || isCurrent) && styles.connectorActive,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentIndex + 1) / steps.length) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  stepCircleCurrent: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}15`,
  },
  stepCircleUpcoming: {
    backgroundColor: COLORS.primaryLight,
    borderColor: `${COLORS.grey}50`,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  stepIconCompleted: {
    fontSize: 18,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: COLORS.grey,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    left: '50%',
    top: 18,
    width: '100%',
    height: 2,
    backgroundColor: COLORS.grey,
    marginLeft: 20,
  },
  connectorActive: {
    backgroundColor: COLORS.gold,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: `${COLORS.grey}30`,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 1.5,
  },
});
