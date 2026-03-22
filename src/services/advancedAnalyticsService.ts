/**
 * Advanced Analytics Service
 * Tracks user behavior, engagement, and business metrics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analyticsService';

export interface UserSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  screenPath: string[];
  events: number;
}

export interface ConversionMetrics {
  sessionId: string;
  bookingStarted: boolean;
  bookingCompleted: boolean;
  paymentAttempted: boolean;
  paymentCompleted: boolean;
  timeToConversion?: number;
  abandonmentReason?: string;
}

export interface EngagementMetrics {
  totalSessions: number;
  totalScreenViews: number;
  totalEvents: number;
  averageSessionDuration: number;
  lastActiveTime: number;
  daysSinceLastActive: number;
}

export interface BusinessMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
  returnCustomerRate: number;
  averageRating: number;
}

const ANALYTICS_STORAGE_KEY = '@qlinica_analytics';
const SESSION_STORAGE_KEY = '@qlinica_session';
const CONVERSION_STORAGE_KEY = '@qlinica_conversions';

class AdvancedAnalyticsService {
  private currentSession: UserSession | null = null;
  private sessionScreens: string[] = [];
  private conversionMetrics: ConversionMetrics | null = null;
  private batchEvents: Array<{
    name: string;
    params: Record<string, any>;
    timestamp: number;
  }> = [];

  /**
   * Initialize a new session
   */
  initializeSession(userId: string): void {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      screenPath: [],
      events: 0,
    };

    this.conversionMetrics = {
      sessionId,
      bookingStarted: false,
      bookingCompleted: false,
      paymentAttempted: false,
      paymentCompleted: false,
    };

    this.saveSession();

    console.log(`📊 Session initialized: ${sessionId}`);
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string): void {
    if (!this.currentSession) {
      console.warn('Session not initialized');
      return;
    }

    this.currentSession.screenPath.push(screenName);
    this.sessionScreens.push(screenName);

    this.batchEvent('screen_view', {
      screenName,
      sessionId: this.currentSession.id,
      screenNumber: this.currentSession.screenPath.length,
    });

    console.log(`📱 Screen view: ${screenName}`);
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!this.currentSession) {
      console.warn('Session not initialized');
      return;
    }

    this.currentSession.events++;

    this.batchEvent(eventName, {
      ...params,
      sessionId: this.currentSession.id,
    });

    console.log(`📈 Event tracked: ${eventName}`, params);
  }

  /**
   * Track conversion funnel
   */
  trackConversionFunnel(step: keyof Omit<ConversionMetrics, 'sessionId' | 'timeToConversion' | 'abandonmentReason'>): void {
    if (!this.currentSession || !this.conversionMetrics) {
      return;
    }

    const currentTime = Date.now();
    const timeToStep = currentTime - this.currentSession.startTime;

    if (step === 'bookingStarted') {
      this.conversionMetrics.bookingStarted = true;
      this.trackEvent('funnel_booking_started', { timeMs: timeToStep });
    } else if (step === 'bookingCompleted') {
      this.conversionMetrics.bookingCompleted = true;
      this.conversionMetrics.timeToConversion = timeToStep;
      this.trackEvent('funnel_booking_completed', { timeMs: timeToStep });
    } else if (step === 'paymentAttempted') {
      this.conversionMetrics.paymentAttempted = true;
      this.trackEvent('funnel_payment_attempted', { timeMs: timeToStep });
    } else if (step === 'paymentCompleted') {
      this.conversionMetrics.paymentCompleted = true;
      this.conversionMetrics.timeToConversion = timeToStep;
      this.trackEvent('funnel_payment_completed', { timeMs: timeToStep });
    }

    this.saveConversionMetrics();
  }

  /**
   * Track abandonment
   */
  trackAbandonment(reason: string): void {
    if (!this.conversionMetrics) {
      return;
    }

    this.conversionMetrics.abandonmentReason = reason;
    this.trackEvent('funnel_abandoned', { reason });

    console.log(`❌ Conversion abandoned: ${reason}`);
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, metadata?: Record<string, any>): void {
    this.trackEvent('user_engagement', {
      action,
      ...metadata,
    });
  }

  /**
   * Track error with context
   */
  trackErrorWithContext(
    error: Error,
    context: {
      screen?: string;
      action?: string;
      data?: Record<string, any>;
    }
  ): void {
    this.trackEvent('error_occurred', {
      message: error.message,
      screen: context.screen,
      action: context.action,
      ...context.data,
    });

    // Also send to default analytics service
    analyticsService.trackError(error, context);
  }

  /**
   * Batch event (internal)
   */
  private batchEvent(
    name: string,
    params?: Record<string, any>
  ): void {
    this.batchEvents.push({
      name,
      params: params || {},
      timestamp: Date.now(),
    });

    // Send batch if reached limit (100 events)
    if (this.batchEvents.length >= 100) {
      this.flushBatch();
    }
  }

  /**
   * Flush batched events to analytics backend
   */
  async flushBatch(): Promise<void> {
    if (this.batchEvents.length === 0) {
      return;
    }

    try {
      const events = [...this.batchEvents];
      this.batchEvents = [];

      // Send to analytics backend
      analyticsService.trackEvent('batch_analytics', {
        count: events.length,
        events: events.map((e) => ({
          name: e.name,
          timestamp: e.timestamp,
        })),
      });

      console.log(`📤 Flushed ${events.length} analytics events`);
    } catch (error) {
      console.error('Error flushing analytics batch:', error);
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Flush remaining events
    await this.flushBatch();

    // Track session end event
    this.batchEvent('session_end', {
      duration: this.currentSession.duration,
      screenViews: this.currentSession.screenPath.length,
      events: this.currentSession.events,
    });

    await this.flushBatch();

    console.log(
      `🏁 Session ended (${this.currentSession.duration}ms, ${this.currentSession.screenPath.length} screens, ${this.currentSession.events} events)`
    );

    this.currentSession = null;
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(userId: string): Promise<EngagementMetrics> {
    try {
      const data = await AsyncStorage.getItem(`${ANALYTICS_STORAGE_KEY}_${userId}`);
      if (!data) {
        return {
          totalSessions: 0,
          totalScreenViews: 0,
          totalEvents: 0,
          averageSessionDuration: 0,
          lastActiveTime: 0,
          daysSinceLastActive: 0,
        };
      }

      const parsed = JSON.parse(data);
      const lastActive = parsed.lastActiveTime || 0;
      const daysSinceActive = lastActive ? Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24)) : 0;

      return {
        totalSessions: parsed.totalSessions || 0,
        totalScreenViews: parsed.totalScreenViews || 0,
        totalEvents: parsed.totalEvents || 0,
        averageSessionDuration: parsed.averageSessionDuration || 0,
        lastActiveTime,
        daysSinceLastActive: daysSinceActive,
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        totalSessions: 0,
        totalScreenViews: 0,
        totalEvents: 0,
        averageSessionDuration: 0,
        lastActiveTime: 0,
        daysSinceLastActive: 0,
      };
    }
  }

  /**
   * Get conversion metrics
   */
  async getConversionMetrics(): Promise<ConversionMetrics | null> {
    try {
      const data = await AsyncStorage.getItem(CONVERSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting conversion metrics:', error);
      return null;
    }
  }

  /**
   * Save session to storage
   */
  private saveSession(): void {
    if (!this.currentSession) return;

    AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession)).catch((error) => {
      console.error('Error saving session:', error);
    });
  }

  /**
   * Save conversion metrics to storage
   */
  private saveConversionMetrics(): void {
    if (!this.conversionMetrics) return;

    AsyncStorage.setItem(CONVERSION_STORAGE_KEY, JSON.stringify(this.conversionMetrics)).catch((error) => {
      console.error('Error saving conversion metrics:', error);
    });
  }

  /**
   * Get current session
   */
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Get session screen path
   */
  getSessionScreenPath(): string[] {
    return [...this.sessionScreens];
  }

  /**
   * Clear all analytics data (for testing)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      await AsyncStorage.removeItem(CONVERSION_STORAGE_KEY);
      this.batchEvents = [];
      console.log('🧹 Analytics data cleared');
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
