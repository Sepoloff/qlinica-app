/**
 * Haptic Feedback - Vibration feedback for user interactions
 */

import * as Haptics from 'expo-haptics';

export const triggerLightFeedback = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerMediumFeedback = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerHeavyFeedback = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerSuccessFeedback = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerErrorFeedback = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerWarningFeedback = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerSelectionFeedback = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};
