import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface FormErrorBoxProps {
  errors: Record<string, string>;
  visible?: boolean;
}

/**
 * Component to display form validation errors
 * Shows all errors in a styled container
 */
export const FormErrorBox: React.FC<FormErrorBoxProps> = ({
  errors,
  visible = true,
}) => {
  const errorList = Object.values(errors).filter(Boolean);

  if (!visible || errorList.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Erros encontrados:</Text>
      {errorList.map((error, index) => (
        <View key={index} style={styles.errorItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.danger}15`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans',
    color: COLORS.danger,
    marginBottom: 8,
  },
  errorItem: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 12,
    color: COLORS.danger,
    marginRight: 8,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: COLORS.danger,
    flex: 1,
    lineHeight: 16,
  },
});
