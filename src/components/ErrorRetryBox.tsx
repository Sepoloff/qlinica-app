'use strict';

/**
 * ErrorRetryBox Component
 * Displays errors with a retry button for failed operations
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

export interface ErrorRetryBoxProps {
  error: string | Error | null;
  onRetry: () => void;
  onDismiss?: () => void;
  title?: string;
  retryLabel?: string;
  dismissLabel?: string;
  style?: ViewStyle;
  showDismiss?: boolean;
  animated?: boolean;
}

export const ErrorRetryBox: React.FC<ErrorRetryBoxProps> = ({
  error,
  onRetry,
  onDismiss,
  title = 'Oops!',
  retryLabel = 'Tentar Novamente',
  dismissLabel = 'Descartar',
  style,
  showDismiss = true,
  animated = true,
}) => {
  const { colors } = useTheme();
  const [scaleAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (error && animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else if (!error && animated) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error, animated, scaleAnim]);

  if (!error) {
    return null;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  const animatedStyle = animated
    ? {
        transform: [{ scale: scaleAnim }],
      }
    : {};

  const containerStyle = animated ? (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {renderContent()}
    </Animated.View>
  ) : (
    <View style={[styles.container, style]}>{renderContent()}</View>
  );

  function renderContent() {
    return (
      <>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.danger },
          ]}
        >
          <Text style={styles.icon}>⚠️</Text>
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.message,
            { color: colors.textSecondary },
          ]}
          numberOfLines={3}
        >
          {errorMessage}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {retryLabel}
            </Text>
          </TouchableOpacity>

          {showDismiss && onDismiss && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: colors.textSecondary },
              ]}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                {dismissLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }

  return animated ? containerStyle : containerStyle;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff9f0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
