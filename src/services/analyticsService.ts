'use strict';

/**
 * Analytics Service
 * 
 * Integrates with multiple analytics providers:
 * - Sentry (error tracking)
 * - Custom logging (local storage)
 * 
 * In production, integrate with:
 * - Mixpanel / Segment
 * - Firebase Analytics
 * - Amplitude
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  debugMode: boolean;
  maxLocalEvents: number;
}

class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: true,
    debugMode: __DEV__,
    maxLocalEvents: 100,
  };

  private events: AnalyticsEvent[] = [];
  private sessionId: string = this.generateSessionId();

  initialize(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event: AnalyticsEvent) {
    if (!this.config.enabled) return;

    const enrichedEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: event.timestamp || Date.now(),
    };

    // Store locally
    this.storeEvent(enrichedEvent);

    // Log in debug mode
    if (this.config.debugMode) {
      console.log('📊 Analytics:', enrichedEvent);
    }

    // Send to external services
    this.sendToExternal(enrichedEvent);
  }

  trackPageView(screenName: string, properties?: Record<string, any>) {
    this.track({
      name: 'page_view',
      properties: {
        screen_name: screenName,
        ...properties,
      },
      timestamp: Date.now(),
    });
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    this.track({
      name: eventName,
      properties,
      timestamp: Date.now(),
    });
  }

  trackError(error: Error | string, context?: Record<string, any>) {
    const errorMsg = typeof error === 'string' ? error : error.message;
    const stack = error instanceof Error ? error.stack : undefined;

    this.track({
      name: 'error_occurred',
      properties: {
        error_message: errorMsg,
        error_stack: stack,
        ...context,
      },
      timestamp: Date.now(),
    });

    // Also log to console
    console.error('❌ Analytics Error Track:', {
      errorMsg,
      stack,
      context,
    });
  }

  trackBookingEvent(action: 'started' | 'service_selected' | 'therapist_selected' | 'date_selected' | 'completed' | 'cancelled', bookingData?: Record<string, any>) {
    this.track({
      name: `booking_${action}`,
      properties: bookingData,
      timestamp: Date.now(),
    });
  }

  trackAuthEvent(action: 'login' | 'register' | 'logout', userId?: string) {
    this.track({
      name: `auth_${action}`,
      userId,
      timestamp: Date.now(),
    });
  }

  setUserId(userId: string) {
    // Store user ID for all subsequent events
    const allEvents = this.events.map(e => ({
      ...e,
      userId,
    }));
    this.events = allEvents;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  startNewSession() {
    this.sessionId = this.generateSessionId();
    this.events = [];
  }

  private storeEvent(event: AnalyticsEvent) {
    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.config.maxLocalEvents) {
      this.events = this.events.slice(-this.config.maxLocalEvents);
    }
  }

  private async sendToExternal(event: AnalyticsEvent) {
    try {
      // Example: Send to Sentry for error events
      if (event.name === 'error_occurred') {
        console.log('📤 Would send error to Sentry:', event);
        // In production: Sentry.captureException(event.properties?.error);
      }

      // Example: Send to custom backend
      if (this.config.enabled && !this.config.debugMode) {
        // Optionally batch and send events to your backend
        // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
      }
    } catch (error) {
      console.error('Failed to send analytics to external service:', error);
    }
  }

  getLocalEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearLocalEvents() {
    this.events = [];
  }
}

export const analyticsService = new AnalyticsService();
