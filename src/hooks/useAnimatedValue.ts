/**
 * useAnimatedValue Hook - Manage animated values with callbacks
 */

import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useAnimatedValue = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = (toValue: number, duration: number = 300, useNativeDriver: boolean = true) => {
    return new Promise<void>((resolve) => {
      Animated.timing(animatedValue, {
        toValue,
        duration,
        useNativeDriver,
      }).start(({ finished }) => {
        if (finished) resolve();
      });
    });
  };

  const interpolate = (outputRange: (string | number)[]) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange,
    });
  };

  const reset = () => {
    animatedValue.setValue(initialValue);
  };

  return {
    value: animatedValue,
    animate,
    interpolate,
    reset,
    setValue: (val: number) => animatedValue.setValue(val),
  };
};
