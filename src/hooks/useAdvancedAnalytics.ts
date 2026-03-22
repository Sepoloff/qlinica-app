/**
 * useAdvancedAnalytics
 * Hook for easy analytics tracking throughout the app
 */

import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { advancedAnalyticsService } from '../services/advancedAnalyticsService';
import { useAuth } from '../context/AuthContext';

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();

  // Initialize on mount
  useEffect(() => {
    const initAnalytics = async () => {
      await advancedAnalyticsService.initialize(user?.id);
    };
    initAnalytics();
  }, [user?.id]);

  // Track screen view
  const trackScreenView = useCallback(
    (screenName: string, metadata?: Record<string, any>) => {
      advancedAnalyticsService.trackScreenView(screenName, metadata);
    },
    []
  );

  // Track user action
  const trackUserAction = useCallback(
    (action: string, category?: string, metadata?: Record<string, any>) => {
      advancedAnalyticsService.trackUserAction(action, category, metadata);
    },
    []
  );

  // Track API call
  const trackAPICall = useCallback(
    (
      method: string,
      endpoint: string,
      statusCode?: number,
      duration?: number,
      metadata?: Record<string, any>
    ) => {
      advancedAnalyticsService.trackAPICall(method, endpoint, statusCode, duration, metadata);
    },
    []
  );

  // Track error
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    advancedAnalyticsService.trackError(error, context);
  }, []);

  // Track conversion
  const trackConversion = useCallback(
    (
      conversionType: 'booking' | 'signup' | 'payment' | 'review',
      conversionValue?: number,
      metadata?: Record<string, any>
    ) => {
      advancedAnalyticsService.trackConversion(conversionType, conversionValue, metadata);
    },
    []
  );

  // Track custom event
  const trackCustomEvent = useCallback(
    (name: string, metadata?: Record<string, any>) => {
      advancedAnalyticsService.trackCustomEvent(name, metadata);
    },
    []
  );

  // Track performance metric
  const trackPerformanceMetric = useCallback(
    (metric: string, value: number, unit?: string) => {
      advancedAnalyticsService.trackPerformanceMetric(metric, value, unit);
    },
    []
  );

  return {
    trackScreenView,
    trackUserAction,
    trackAPICall,
    trackError,
    trackConversion,
    trackCustomEvent,
    trackPerformanceMetric,
  };
};
