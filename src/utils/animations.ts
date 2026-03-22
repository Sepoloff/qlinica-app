/**
 * Animation utilities for smooth transitions and interactions
 */

import { Animated, Easing } from 'react-native';

export const fadeIn = (duration: number = 300) => {
  const fadeAnim = new Animated.Value(0);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();

  return fadeAnim;
};

export const slideInUp = (duration: number = 400) => {
  const slideAnim = new Animated.Value(100);

  Animated.timing(slideAnim, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return slideAnim;
};

export const slideInLeft = (duration: number = 400) => {
  const slideAnim = new Animated.Value(-100);

  Animated.timing(slideAnim, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return slideAnim;
};

export const scaleIn = (duration: number = 300) => {
  const scaleAnim = new Animated.Value(0.9);

  Animated.timing(scaleAnim, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return scaleAnim;
};

export const pulseAnimation = (duration: number = 1000) => {
  const pulseAnim = new Animated.Value(1);

  const pulse = Animated.sequence([
    Animated.timing(pulseAnim, {
      toValue: 0.95,
      duration: duration / 2,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: duration / 2,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
  ]);

  Animated.loop(pulse).start();

  return pulseAnim;
};

export const createSpringAnimation = (value: Animated.Value, toValue: number, tension: number = 40) => {
  Animated.spring(value, {
    toValue,
    tension,
    friction: 7,
    useNativeDriver: true,
  }).start();
};

export const createSequenceAnimation = (animations: Animated.CompositeAnimation[]) => {
  Animated.sequence(animations).start();
};

export const createParallelAnimation = (animations: Animated.CompositeAnimation[]) => {
  Animated.parallel(animations).start();
};
