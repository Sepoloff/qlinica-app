import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

/**
 * Visual progress indicator for multi-step flows (booking, etc)
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    index <= currentStep ? COLORS.gold : COLORS.grey,
                },
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  {
                    color: index <= currentStep ? '#2C3E50' : '#8895a0',
                  },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#34495E',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
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
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  stepLabel: {
    fontSize: 10,
    color: '#8895a0',
    fontFamily: 'DMSans',
    marginTop: 2,
    textAlign: 'center',
  },
});
