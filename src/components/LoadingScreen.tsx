import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Carregando...',
  fullScreen = true,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator
        size="large"
        color={COLORS.gold}
        style={styles.spinner}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginTop: 8,
  },
});
