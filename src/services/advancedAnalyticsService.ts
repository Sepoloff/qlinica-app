/**
 * Advanced Analytics Service
 * Comprehensive user behavior and app event tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';

export interface AnalyticsEvent {
  id: string;
  type: 'screen_view' | 'user_action' | 'api_call' | 'error' | 'conversion' | 'custom';
  category?: string;
  name: string;
  value?: number | string;
  metadata?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  type: 'conversion';
  conversionType: 'booking' | 'signup' | 'payment' | 'review';
  conversionValue?: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  userId?: string;
  deviceInfo?: Record<string, any>;
  events: AnalyticsEvent[];
}

class AdvancedAnalyticsService {
  private sessionId: string = '';
  private sessionData: SessionData | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;
  private readonly MAX_BATCH_SIZE = 50;
  private readonly BATCH_TIMEOUT_MS = 30000; // 30 seconds
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = '@qlinica_analytics_events';

  /**
   * Initialize analytics service
   */
  async initialize(userId?: string): Promise<void> {
    try {
      this.sessionId = this.generateSessionId();
      this.sessionData = {
        sessionId: this.sessionId,
        startTime: Date.now(),
        userId,
        events: [],
      };

      // Load any pending events from storage
      await this.loadPendingEvents();

      console.log(`📊 Analytics initialized with session: ${this.sessionId}`);
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      type: 'screen_view',
      name: screenName,
      metadata,
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, category?: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      type: 'user_action',
      category,
      name: action,
      metadata,
    });
  }

  /**
   * Track API call
   */
  trackAPICall(
    method: string,
    endpoint: string,
    statusCode?: number,
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      type: 'api_call',
      name: `${method} ${endpoint}`,
      value: duration,
      metadata: {
        method,
        endpoint,
        statusCode,
        duration,
        ...metadata,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      type: 'error',
      name: error.name || 'Unknown Error',
      metadata: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Track conversion (booking, signup, payment, etc.)
   */
  trackConversion(
    conversionType: 'booking' | 'signup' | 'payment' | 'review',
    conversionValue?: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      type: 'conversion',
      name: `conversion_${conversionType}`,
      value: conversionValue,
      metadata: {
        conversionType,
        ...metadata,
      },
    });
  }

  /**
   * Track custom event
   */
  trackCustomEvent(name: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      type: 'custom',
      name,
      metadata,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformanceMetric(metric: string, value: number, unit: string = 'ms'): void {
    this.trackCustomEvent(`performance_${metric}`, {
      metric,
      value,
      unit,
    });
  }

  /**
   * Core event tracking method
   */
  private trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    if (!this.isEnabled || !this.sessionData) return;

    const analyticsEvent: AnalyticsEvent = {
      id: `${this.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.sessionData.userId,
      ...event,
    };

    this.eventQueue.push(analyticsEvent);
    this.sessionData.events.push(analyticsEvent);

    // Check if should batch send
    if (this.eventQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushEvents();
    } else if (!this.batchTimer) {
      this.scheduleBatchSend();
    }
  }

  /**
   * Schedule batch send with timeout
   */
  private scheduleBatchSend(): void {
    this.batchTimer = setTimeout(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.BATCH_TIMEOUT_MS);
  }

  /**
   * Send all queued events
   */
  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Try to send to backend
      await this.sendAnalyticsEvents(eventsToSend);
      console.log(`📤 Sent ${eventsToSend.length} analytics events`);
    } catch (error) {
      console.warn('Failed to send analytics events, storing locally:', error);
      // Save to storage for later retry
      await this.savePendingEvents(eventsToSend);
    }
  }

  /**
   * Send events to backend
   */
  private async sendAnalyticsEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      await api.post('/analytics/events', {
        events,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending analytics events:', error);
      throw error;
    }
  }

  /**
   * Save pending events to storage
   */
  private async savePendingEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      const pendingEvents = stored ? JSON.parse(stored) : [];
      const combined = [...pendingEvents, ...events];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(combined));
    } catch (error) {
      console.error('Error saving pending analytics events:', error);
    }
  }

  /**
   * Load pending events from storage and try to send
   */
  private async loadPendingEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const pendingEvents = JSON.parse(stored);
        if (pendingEvents.length > 0) {
          console.log(`📋 Found ${pendingEvents.length} pending analytics events`);
          // Try to send them
          try {
            await this.sendAnalyticsEvents(pendingEvents);
            await AsyncStorage.removeItem(this.STORAGE_KEY);
          } catch (error) {
            // Will retry next time
            console.warn('Failed to send pending events, will retry later');
          }
        }
      }
    } catch (error) {
      console.error('Error loading pending analytics events:', error);
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(): {
    sessionId: string;
    duration: number;
    eventCount: number;
    conversions: number;
  } {
    if (!this.sessionData) {
      return { sessionId: '', duration: 0, eventCount: 0, conversions: 0 };
    }

    const duration = Date.now() - this.sessionData.startTime;
    const conversions = this.sessionData.events.filter(
      (e) => e.type === 'conversion'
    ).length;

    return {
      sessionId: this.sessionId,
      duration,
      eventCount: this.sessionData.events.length,
      conversions,
    };
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Cleanup on app close
   */
  async cleanup(): Promise<void> {
    await this.flushEvents();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
