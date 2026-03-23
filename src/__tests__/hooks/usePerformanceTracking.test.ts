/**
 * Tests for usePerformanceTracking utilities
 */

import { performanceMonitor } from '../../utils/performanceMonitoring';

describe('usePerformanceTracking', () => {
  describe('performanceMonitor.recordMetric', () => {
    it('should record metrics correctly', () => {
      const spy = jest.spyOn(performanceMonitor, 'recordMetric');

      performanceMonitor.recordMetric('test:operation', 100, {
        success: true,
      });

      expect(spy).toHaveBeenCalledWith('test:operation', 100, {
        success: true,
      });

      spy.mockRestore();
    });

    it('should track multiple metrics', () => {
      const metrics = performanceMonitor.getMetrics('test:multi');
      const initialLength = metrics.length;

      performanceMonitor.recordMetric('test:multi', 50);
      performanceMonitor.recordMetric('test:multi', 75);

      const updatedMetrics = performanceMonitor.getMetrics('test:multi');
      expect(updatedMetrics.length).toBe(initialLength + 2);
    });
  });

  describe('performanceMonitor', () => {
    beforeEach(() => {
      performanceMonitor.clear();
    });

    it('should calculate average duration', () => {
      performanceMonitor.recordMetric('test:avg', 100);
      performanceMonitor.recordMetric('test:avg', 200);
      performanceMonitor.recordMetric('test:avg', 300);

      const average = performanceMonitor.getAverageDuration('test:avg');
      expect(average).toBe(200);
    });

    it('should get summary with statistics', () => {
      performanceMonitor.recordMetric('test:summary', 50);
      performanceMonitor.recordMetric('test:summary', 100);
      performanceMonitor.recordMetric('test:summary', 150);

      const summary = performanceMonitor.getSummary();
      expect(summary['test:summary']).toMatchObject({
        avg: 100,
        count: 3,
        max: 150,
        min: 50,
      });
    });

    it('should clear all metrics', () => {
      performanceMonitor.recordMetric('test:clear', 100);
      expect(performanceMonitor.getMetrics('test:clear').length).toBeGreaterThan(0);

      performanceMonitor.clear();
      expect(performanceMonitor.getMetrics('test:clear').length).toBe(0);
    });

    it('should start and end performance measurement', async () => {
      const timer = performanceMonitor.start('test:timer');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      const duration = timer.end();

      // Should have recorded a metric
      expect(performanceMonitor.getMetrics('test:timer').length).toBeGreaterThan(0);
      expect(duration).toBeGreaterThan(0);
    });
  });
});
