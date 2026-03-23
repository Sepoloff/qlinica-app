export interface AnalyticsEvent {
  eventName: string;
  timestamp: Date;
  userId?: string;
  properties?: Record<string, any>;
  sessionId?: string;
}

export interface AnalyticsSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  screenViews: string[];
  totalEvents: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, AnalyticsSession> = new Map();
  private currentSessionId: string;
  private currentUserId?: string;

  private constructor() {
    this.currentSessionId = this.generateSessionId();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date(),
      userId: this.currentUserId,
      properties,
      sessionId: this.currentSessionId,
    };

    this.events.push(event);

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Send to backend if available
    this.sendEventToBackend(event);
  }

  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent('screen_view', {
      screenName,
      ...properties,
    });
  }

  trackBookingFlow(step: 'started' | 'service_selected' | 'therapist_selected' | 'date_selected' | 'completed' | 'cancelled', properties?: Record<string, any>): void {
    this.trackEvent(`booking_${step}`, properties);
  }

  trackPayment(status: 'initiated' | 'success' | 'failed', amount: number, properties?: Record<string, any>): void {
    this.trackEvent(`payment_${status}`, {
      amount,
      ...properties,
    });
  }

  trackError(errorName: string | Error, errorMessage?: string | Record<string, any>, errorStack?: string): void {
    let name = '';
    let message = '';
    let stack = '';

    if (typeof errorName === 'string') {
      name = errorName;
      message = errorMessage ? (typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)) : '';
      stack = errorStack || '';
    } else if (errorName instanceof Error) {
      name = errorName.name;
      message = errorName.message;
      stack = errorName.stack || '';
    }

    this.trackEvent('error_occurred', {
      errorName: name,
      errorMessage: message,
      errorStack: stack,
    });
  }

  trackUserAction(actionName: string, properties?: Record<string, any>): void {
    this.trackEvent(`user_action_${actionName}`, properties);
  }

  trackPerformance(metricName: string, duration: number, properties?: Record<string, any>): void {
    this.trackEvent(`performance_${metricName}`, {
      duration,
      ...properties,
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByName(eventName: string): AnalyticsEvent[] {
    return this.events.filter(e => e.eventName === eventName);
  }

  getEventsByUser(userId: string): AnalyticsEvent[] {
    return this.events.filter(e => e.userId === userId);
  }

  getSessionAnalytics(): { totalEvents: number; uniqueUsers: number; totalSessions: number } {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(this.events.map(e => e.sessionId)).size;

    return {
      totalEvents: this.events.length,
      uniqueUsers,
      totalSessions: uniqueSessions,
    };
  }

  clearEvents(): void {
    this.events = [];
  }

  startNewSession(): string {
    this.currentSessionId = this.generateSessionId();
    return this.currentSessionId;
  }

  private async sendEventToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      // This would be implemented to send to your backend
      // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
      // For now, just log in development
      if (__DEV__) {
        console.log('[Analytics]', event.eventName, event.properties);
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  exportAnalytics(): Record<string, any> {
    return {
      exportDate: new Date().toISOString(),
      totalEvents: this.events.length,
      events: this.events,
      summary: this.getSessionAnalytics(),
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
