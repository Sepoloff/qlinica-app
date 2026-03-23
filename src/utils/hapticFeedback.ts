/**
 * Haptic Feedback - Vibration feedback for user interactions
 */

let Haptics: any = null;

try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.warn('expo-haptics not installed');
}

export const triggerLightFeedback = async () => {
  try {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerMediumFeedback = async () => {
  try {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerHeavyFeedback = async () => {
  try {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerSuccessFeedback = async () => {
  try {
    if (Haptics?.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerErrorFeedback = async () => {
  try {
    if (Haptics?.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerWarningFeedback = async () => {
  try {
    if (Haptics?.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

export const triggerSelectionFeedback = async () => {
  try {
    if (Haptics?.selectionAsync) {
      await Haptics.selectionAsync();
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};
