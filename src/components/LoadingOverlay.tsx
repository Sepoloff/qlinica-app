'use strict';

import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Text,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/Colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  style?: ViewStyle;
  spinnerColor?: string;
}

/**
 * Full-screen or overlay loading indicator with optional message
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  fullScreen = true,
  transparent = true,
  style,
  spinnerColor = COLORS.gold,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.overlay;

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[containerStyle, style]}>
        <View style={styles.content}>
          <ActivityIndicator
            size="large"
            color={spinnerColor}
            style={styles.spinner}
          />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    width: 50,
    height: 50,
  },
  message: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
});
