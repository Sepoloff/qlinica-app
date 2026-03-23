'use strict';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/Colors';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationSummaryProps {
  errors: ValidationError[] | string[];
  title?: string;
  visible?: boolean;
}

/**
 * Component to display validation errors in a summary format
 * Shows all validation issues at once for better UX
 */
export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  title = 'Erros de Validação',
  visible = true,
}) => {
  if (!visible || !errors || errors.length === 0) {
    return null;
  }

  const errorsList = errors.map((error) => {
    if (typeof error === 'string') {
      return { field: '', message: error };
    }
    return error;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView style={styles.errorsList} scrollEnabled={errorsList.length > 3}>
        {errorsList.map((error, index) => (
          <View key={index} style={styles.errorItem}>
            <Text style={styles.errorBullet}>•</Text>
            <View style={styles.errorContent}>
              {error.field && (
                <Text style={styles.errorField}>{error.field}:</Text>
              )}
              <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  errorsList: {
    maxHeight: 150,
  },
  errorItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  errorBullet: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginRight: 8,
    marginTop: 2,
  },
  errorContent: {
    flex: 1,
  },
  errorField: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
  },
  errorMessage: {
    fontSize: 12,
    color: `${COLORS.primaryDark}80`,
    marginTop: 2,
  },
});
