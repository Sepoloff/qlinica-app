'use strict';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Cormorant',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
});
