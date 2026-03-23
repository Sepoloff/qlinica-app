import { useCallback } from 'react';
import { logger } from '../utils/logger';

interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface SimpleAnalyticsResult {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackScreenView: (screenName: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackTiming: (name: string, durationMs: number, properties?: Record<string, any>) => void;
  trackConversion: (type: string, value?: number) => void;
}

/**
 * Simplified analytics hook for tracking user interactions
 * Logs to console in development and can be extended for backend services
 * 
 * @example
 * const { trackEvent, trackScreenView, trackError } = useSimpleAnalytics();
 * 
 * trackScreenView('home');
 * trackEvent('button_clicked', { buttonName: 'login' });
 * trackError(error, { screen: 'home' });
 */
export const useSimpleAnalytics = (): SimpleAnalyticsResult => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: eventName,
      timestamp: Date.now(),
      properties,
    };

    logger.debug(`📊 Event tracked: ${eventName}`, properties);

    // In production, send to analytics backend
    // Example: analyticsService.send(event);
  }, []);

  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: `screen_view_${screenName}`,
      timestamp: Date.now(),
      properties: {
        screen: screenName,
        ...properties,
      },
    };

    logger.debug(`📱 Screen viewed: ${screenName}`, properties);

    // In production, send to analytics backend
    // Example: analyticsService.send(event);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: 'error_occurred',
      timestamp: Date.now(),
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    };

    logger.error(`🔴 Error tracked: ${error.message}`, error);

    // In production, send to error tracking service
    // Example: errorTrackingService.send(event);
  }, []);

  const trackTiming = useCallback((name: string, durationMs: number, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name: `timing_${name}`,
      timestamp: Date.now(),
      properties: {
        durationMs,
        ...properties,
      },
    };

    logger.debug(`⏱️ Timing tracked: ${name} (${durationMs}ms)`, properties);

    // In production, send to analytics backend
    // Example: analyticsService.send(event);
  }, []);

  const trackConversion = useCallback((type: string, value?: number) => {
    const event: AnalyticsEvent = {
      name: `conversion_${type}`,
      timestamp: Date.now(),
      properties: {
        value: value || 1,
      },
    };

    logger.debug(`🎯 Conversion tracked: ${type}`, { value });

    // In production, send to conversion tracking service
    // Example: conversionService.send(event);
  }, []);

  return {
    trackEvent,
    trackScreenView,
    trackError,
    trackTiming,
    trackConversion,
  };
};
