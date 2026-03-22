/**
 * AnimatedCard - Card component with entrance animations
 */

import React, { useEffect } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { slideInUp, fadeIn } from '../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  duration = 400,
  onAnimationComplete,
}) => {
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a252f',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#D4AF8F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
