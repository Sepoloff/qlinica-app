import { useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = (screenName?: string) => {
  useEffect(() => {
    if (screenName) {
      analyticsService.trackScreenView(screenName);
    }
  }, [screenName]);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    analyticsService.trackEvent(eventName, properties);
  }, []);

  const trackBookingStep = useCallback((step: 'started' | 'service_selected' | 'therapist_selected' | 'date_selected' | 'completed' | 'cancelled', properties?: Record<string, any>) => {
    analyticsService.trackBookingFlow(step, properties);
  }, []);

  const trackPayment = useCallback((status: 'initiated' | 'success' | 'failed', amount: number, properties?: Record<string, any>) => {
    analyticsService.trackPayment(status, amount, properties);
  }, []);

  const trackError = useCallback((errorName: string, errorMessage: string, errorStack?: string) => {
    analyticsService.trackError(errorName, errorMessage, errorStack);
  }, []);

  const trackTiming = useCallback((metricName: string, duration: number) => {
    analyticsService.trackPerformance(metricName, duration);
  }, []);

  const trackScreenView = useCallback((screenName: string, properties?: Record<string, any>) => {
    analyticsService.trackScreenView(screenName, properties);
  }, []);

  return {
    trackEvent,
    trackBookingStep,
    trackPayment,
    trackError,
    trackTiming,
    trackScreenView,
  };
};
