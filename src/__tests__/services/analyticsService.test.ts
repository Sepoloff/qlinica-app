import { analyticsService } from '../../services/analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    analyticsService.clearEvents();
  });

  it('should track events', () => {
    analyticsService.trackEvent('test_event', { prop: 'value' });

    const events = analyticsService.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('test_event');
    expect(events[0].properties).toEqual({ prop: 'value' });
  });

  it('should track screen views', () => {
    analyticsService.trackScreenView('HomeScreen');

    const events = analyticsService.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('screen_view');
    expect(events[0].properties?.screenName).toBe('HomeScreen');
  });

  it('should track booking flow steps', () => {
    analyticsService.trackBookingFlow('started', { bookingId: '123' });

    const events = analyticsService.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('booking_started');
    expect(events[0].properties?.bookingId).toBe('123');
  });

  it('should track payment events', () => {
    analyticsService.trackPayment('success', 100, { paymentMethod: 'card' });

    const events = analyticsService.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('payment_success');
    expect(events[0].properties?.amount).toBe(100);
    expect(events[0].properties?.paymentMethod).toBe('card');
  });

  it('should track errors', () => {
    analyticsService.trackError('NetworkError', 'Connection failed');

    const events = analyticsService.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('error_occurred');
    expect(events[0].properties?.errorName).toBe('NetworkError');
  });

  it('should filter events by name', () => {
    analyticsService.trackEvent('event_a');
    analyticsService.trackEvent('event_b');
    analyticsService.trackEvent('event_a');

    const filteredEvents = analyticsService.getEventsByName('event_a');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.every(e => e.eventName === 'event_a')).toBe(true);
  });

  it('should set and filter events by user', () => {
    analyticsService.setUserId('user_123');
    analyticsService.trackEvent('user_event');

    const userEvents = analyticsService.getEventsByUser('user_123');
    expect(userEvents).toHaveLength(1);
    expect(userEvents[0].userId).toBe('user_123');
  });

  it('should get session analytics', () => {
    analyticsService.setUserId('user_123');
    analyticsService.trackEvent('event_1');
    analyticsService.trackEvent('event_2');

    const analytics = analyticsService.getSessionAnalytics();
    expect(analytics.totalEvents).toBe(2);
    expect(analytics.uniqueUsers).toBe(1);
    expect(analytics.totalSessions).toBe(1);
  });

  it('should start new session', () => {
    const session1 = analyticsService.startNewSession();
    analyticsService.trackEvent('event_1');

    const session2 = analyticsService.startNewSession();
    analyticsService.trackEvent('event_2');

    expect(session1).not.toBe(session2);
    const analytics = analyticsService.getSessionAnalytics();
    expect(analytics.totalSessions).toBe(2);
  });

  it('should export analytics data', () => {
    analyticsService.trackEvent('test_event');

    const exported = analyticsService.exportAnalytics();
    expect(exported.exportDate).toBeDefined();
    expect(exported.totalEvents).toBe(1);
    expect(Array.isArray(exported.events)).toBe(true);
    expect(exported.summary).toBeDefined();
  });

  it('should limit events to 1000', () => {
    for (let i = 0; i < 1100; i++) {
      analyticsService.trackEvent(`event_${i}`);
    }

    const events = analyticsService.getEvents();
    expect(events.length).toBeLessThanOrEqual(1000);
  });
});
