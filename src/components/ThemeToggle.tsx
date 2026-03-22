/**
 * ThemeToggle
 * Component for switching between light/dark/system themes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showLabel = true,
}) => {
  const { mode, isDark, colors, setMode } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIcon = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    handlePressIcon();
    setMode(newMode);
  };

  const sizeStyles = {
    small: { containerPadding: 4, buttonSize: 28, fontSize: 12 },
    medium: { containerPadding: 8, buttonSize: 40, fontSize: 14 },
    large: { containerPadding: 12, buttonSize: 48, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          padding: currentSize.containerPadding,
          backgroundColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleModeChange('light')}
        style={[
          styles.button,
          {
            width: currentSize.buttonSize,
            height: currentSize.buttonSize,
            backgroundColor: mode === 'light' ? colors.gold : colors.border,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.icon,
            { fontSize: currentSize.fontSize, transform: [{ scale: mode === 'light' ? scaleAnim : 1 }] },
          ]}
        >
          ☀️
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleModeChange('dark')}
        style={[
          styles.button,
          {
            width: currentSize.buttonSize,
            height: currentSize.buttonSize,
            backgroundColor: mode === 'dark' ? colors.gold : colors.border,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.icon,
            { fontSize: currentSize.fontSize, transform: [{ scale: mode === 'dark' ? scaleAnim : 1 }] },
          ]}
        >
          🌙
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleModeChange('system')}
        style={[
          styles.button,
          {
            width: currentSize.buttonSize,
            height: currentSize.buttonSize,
            backgroundColor: mode === 'system' ? colors.gold : colors.border,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.icon,
            { fontSize: currentSize.fontSize, transform: [{ scale: mode === 'system' ? scaleAnim : 1 }] },
          ]}
        >
          🖥️
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  icon: {
    fontWeight: 'bold',
  },
});
