'use strict';

import { NavigationProp, useNavigation } from '@react-navigation/native';

/**
 * Navigation utility functions for safe navigation
 */

export interface NavigationRoute {
  name: string;
  params?: Record<string, any>;
}

/**
 * Safe navigation with validation
 * Prevents crashes from invalid route names
 */
export const safeNavigate = (
  navigation: NavigationProp<any>,
  routeName: string,
  params?: Record<string, any>
): boolean => {
  try {
    if (!navigation || !routeName) {
      console.warn('⚠️ Navigation: Missing navigation or routeName');
      return false;
    }

    // Check if route exists (basic validation)
    navigation.navigate(routeName as never, params as any);
    return true;
  } catch (error) {
    console.error(`❌ Navigation Error to "${routeName}":`, error);
    return false;
  }
};

/**
 * Go back safely - doesn't crash if can't go back
 */
export const safeGoBack = (navigation: NavigationProp<any>): boolean => {
  try {
    if (!navigation) return false;
    
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    console.warn('⚠️ Navigation: Cannot go back (no history)');
    return false;
  } catch (error) {
    console.error('❌ Navigation Error (goBack):', error);
    return false;
  }
};

/**
 * Replace current route (don't add to history)
 */
export const safeReplace = (
  navigation: NavigationProp<any>,
  routeName: string,
  params?: Record<string, any>
): boolean => {
  try {
    if (!navigation || !routeName) return false;
    
    (navigation as any).replace(routeName, params);
    return true;
  } catch (error) {
    console.error(`❌ Navigation Error (replace to "${routeName}"):`, error);
    return false;
  }
};

/**
 * Reset navigation stack
 * Useful when user logs in/out
 */
export const safeReset = (
  navigation: NavigationProp<any>,
  routeName: string,
  params?: Record<string, any>
): boolean => {
  try {
    if (!navigation || !routeName) return false;
    
    (navigation as any).reset({
      index: 0,
      routes: [{ name: routeName, params }],
    });
    return true;
  } catch (error) {
    console.error(`❌ Navigation Error (reset to "${routeName}"):`, error);
    return false;
  }
};

/**
 * Validate booking flow state before proceeding
 */
export const validateBookingFlow = (
  service?: any,
  therapist?: any,
  date?: string,
  time?: string
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!service) missing.push('service');
  if (!therapist) missing.push('therapist');
  if (!date) missing.push('date');
  if (!time) missing.push('time');

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Validate booking data completeness
 */
export const getBookingFlowProgress = (
  service?: any,
  therapist?: any,
  date?: string,
  time?: string
): {
  currentStep: 1 | 2 | 3 | 4;
  progress: number;
} => {
  let step: 1 | 2 | 3 | 4 = 1;
  
  if (service) step = 2;
  if (therapist) step = 3;
  if (date && time) step = 4;

  return {
    currentStep: step,
    progress: (step / 4) * 100,
  };
};

/**
 * Hook for safe navigation operations
 */
export const useSafeNavigation = () => {
  const navigation = useNavigation();

  return {
    navigate: (routeName: string, params?: Record<string, any>) =>
      safeNavigate(navigation, routeName, params),
    goBack: () => safeGoBack(navigation),
    replace: (routeName: string, params?: Record<string, any>) =>
      safeReplace(navigation, routeName, params),
    reset: (routeName: string, params?: Record<string, any>) =>
      safeReset(navigation, routeName, params),
  };
};
