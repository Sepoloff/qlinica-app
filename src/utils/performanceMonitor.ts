/**
 * Performance Monitoring System
 * Tracks rendering, API calls, and overall app performance
 */

import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface MetricStats {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  slowCount: number;
  slowThreshold: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private timers: Map<string, number> = new Map();
  private slowThresholds: Map<string, number> = new Map();

  constructor() {
    // Default slow thresholds
    this.setSlowThreshold('api', 2000); // 2 seconds
    this.setSlowThreshold('render', 100); // 100ms
    this.setSlowThreshold('navigation', 500); // 500ms
  }

  /**
   * Start a performance measurement
   */
  start(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * End a performance measurement and record it
   */
  end(label: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Timer for "${label}" was never started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    const metric: PerformanceMetric = {
      name: label,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(metric);

    // Clean up timer
    this.timers.delete(label);

    // Check if slow
    const slowThreshold = this.slowThresholds.get(label) || 1000;
    if (duration > slowThreshold) {
      logger.warn(
        `Slow operation: ${label} took ${duration}ms (threshold: ${slowThreshold}ms)`,
        metadata
      );
    }

    return duration;
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, metadata);
      return result;
    } catch (error) {
      this.end(label, { ...metadata, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(
    label: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label, metadata);
      return result;
    } catch (error) {
      this.end(label, { ...metadata, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Set slow threshold for a metric type
   */
  setSlowThreshold(label: string, thresholdMs: number): void {
    this.slowThresholds.set(label, thresholdMs);
  }

  /**
   * Get stats for a specific metric
   */
  getMetricStats(label: string): MetricStats | null {
    const metrics = this.metrics.get(label);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const avgDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const slowThreshold = this.slowThresholds.get(label) || 1000;
    const slowCount = durations.filter((d) => d > slowThreshold).length;

    return {
      count: metrics.length,
      avgDuration,
      minDuration,
      maxDuration,
      totalDuration,
      slowCount,
      slowThreshold,
    };
  }

  /**
   * Get all metrics for a label
   */
  getMetrics(label: string): PerformanceMetric[] {
    return this.metrics.get(label) || [];
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Record<string, PerformanceMetric[]> {
    const result: Record<string, PerformanceMetric[]> = {};
    this.metrics.forEach((metrics, label) => {
      result[label] = metrics;
    });
    return result;
  }

  /**
   * Get summary statistics for all metrics
   */
  getSummary(): Record<string, MetricStats> {
    const summary: Record<string, MetricStats> = {};
    this.metrics.forEach((_, label) => {
      const stats = this.getMetricStats(label);
      if (stats) {
        summary[label] = stats;
      }
    });
    return summary;
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    const summary = this.getSummary();
    logger.info(`Performance Summary:`, summary);

    Object.entries(summary).forEach(([label, stats]) => {
      const message = `${label}: avg ${stats.avgDuration.toFixed(2)}ms (${stats.count} samples, ${stats.slowCount} slow)`;
      logger.debug(message);
    });
  }

  /**
   * Export performance data
   */
  export(): Record<string, PerformanceMetric[]> {
    return this.getAllMetrics();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Clear metrics for a specific label
   */
  clearMetrics(label: string): void {
    this.metrics.delete(label);
    this.timers.delete(label);
  }

  /**
   * Get active timers (for debugging timer leaks)
   */
  getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }

  /**
   * Measure React component render time
   */
  measureRender(componentName: string): () => void {
    const label = `render:${componentName}`;
    this.start(label);

    return () => {
      this.end(label, { component: componentName });
    };
  }

  /**
   * Measure memory usage (if available)
   */
  getMemoryUsage(): { used: number; total: number } | null {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
      };
    }
    return null;
  }

  /**
   * Alert if too many slow operations
   */
  checkSlowOperations(): Array<{ label: string; stats: MetricStats }> {
    const slowOps: Array<{ label: string; stats: MetricStats }> = [];

    this.metrics.forEach((metrics, label) => {
      const stats = this.getMetricStats(label);
      if (stats && stats.slowCount >= 3) {
        slowOps.push({ label, stats });
        logger.warn(
          `${label} has ${stats.slowCount} slow operations (avg: ${stats.avgDuration.toFixed(2)}ms)`,
          'Performance:Alerts'
        );
      }
    });

    return slowOps;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook-compatible performance measurement
 */
export const usePerformance = (componentName: string) => {
  const endMeasure = performanceMonitor.measureRender(componentName);

  return {
    start: (label: string) => performanceMonitor.start(`${componentName}:${label}`),
    end: (label: string, metadata?: Record<string, any>) =>
      performanceMonitor.end(`${componentName}:${label}`, metadata),
    measure: <T,>(label: string, fn: () => T) =>
      performanceMonitor.measure(`${componentName}:${label}`, fn),
    measureAsync: <T,>(label: string, fn: () => Promise<T>) =>
      performanceMonitor.measureAsync(`${componentName}:${label}`, fn),
  };
};

export default performanceMonitor;
