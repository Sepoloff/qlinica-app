import { useCallback } from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

/**
 * Simple analytics tracking hook
 * In production, this would integrate with services like Mixpanel, Segment, etc.
 */
export const useAnalytics = () => {
  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    // Log to console in development
    if (__DEV__) {
      console.log('📊 Analytics Event:', event);
    }

    // TODO: Send to analytics service
    // Example: await analyticsService.track(event);

    return event;
  }, []);

  const trackScreenView = useCallback((screenName: string) => {
    trackEvent('screen_view', { screen_name: screenName });
  }, [trackEvent]);

  const trackBookingStart = useCallback(() => {
    trackEvent('booking_started');
  }, [trackEvent]);

  const trackBookingComplete = useCallback((bookingId: string, amount: number) => {
    trackEvent('booking_completed', { booking_id: bookingId, amount });
  }, [trackEvent]);

  const trackAuthEvent = useCallback((action: 'login' | 'register' | 'logout') => {
    trackEvent(`auth_${action}`);
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    trackEvent('error_occurred', { error, ...context });
  }, [trackEvent]);

  return {
    trackEvent,
    trackScreenView,
    trackBookingStart,
    trackBookingComplete,
    trackAuthEvent,
    trackError,
  };
};
