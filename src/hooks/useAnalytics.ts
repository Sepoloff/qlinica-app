import { useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

/**
 * Analytics tracking hook
 * Wraps analyticsService for use in components
 * Integrates with Sentry, custom logging, and external analytics
 */
export const useAnalytics = () => {
  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(name, properties);
  }, []);

  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    analyticsService.trackPageView(screenName, properties);
  }, []);

  const trackBookingEvent = useCallback((
    action: 'started' | 'service_selected' | 'therapist_selected' | 'date_selected' | 'completed' | 'cancelled',
    bookingData?: Record<string, any>
  ) => {
    analyticsService.trackBookingEvent(action, bookingData);
  }, []);

  const trackAuthEvent = useCallback((action: 'login' | 'register' | 'logout') => {
    analyticsService.trackAuthEvent(action);
  }, []);

  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    analyticsService.trackError(error, context);
  }, []);

  return {
    trackEvent,
    trackScreenView,
    trackBookingEvent,
    trackAuthEvent,
    trackError,
  };
};
