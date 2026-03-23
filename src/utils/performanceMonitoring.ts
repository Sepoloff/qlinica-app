/**
 * Performance Monitoring Utilities
 * Tracks render times, API response times, and memory usage
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  render?: number;
  api?: number;
  navigation?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: PerformanceThresholds = {
    render: 16, // 60fps = 16ms per frame
    api: 1000, // API calls should complete in <1s ideally
    navigation: 300, // Navigation transitions <300ms
  };
  private enabled: boolean = __DEV__; // Only in dev mode

  /**
   * Mark the start of a performance measurement
   */
  start(label: string): { end: (metadata?: Record<string, any>) => number } {
    const startTime = performance.now();

    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        this.recordMetric(label, duration, metadata);

        if (this.enabled) {
          this.checkThreshold(label, duration);
        }

        return duration;
      },
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)?.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * Check if metric exceeds threshold and log warning
   */
  private checkThreshold(label: string, duration: number): void {
    const threshold = this.thresholds.render;
    if (threshold && duration > threshold) {
      console.warn(
        `⚠️ Performance: "${label}" took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(label: string): number {
    const metricList = this.metrics.get(label) || [];
    if (metricList.length === 0) return 0;

    const total = metricList.reduce((sum, m) => sum + m.duration, 0);
    return total / metricList.length;
  }

  /**
   * Get all metrics for a label
   */
  getMetrics(label: string): PerformanceMetric[] {
    return this.metrics.get(label) || [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { avg: number; count: number; max: number; min: number }> {
    const summary: Record<string, any> = {};

    for (const [name, metrics] of this.metrics) {
      if (metrics.length === 0) continue;

      const durations = metrics.map(m => m.duration);
      summary[name] = {
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        count: metrics.length,
        max: Math.max(...durations),
        min: Math.min(...durations),
      };
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log current summary to console
   */
  logSummary(): void {
    if (!this.enabled) return;
    console.log('📊 Performance Summary:', this.getSummary());
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render times
 */
export const useRenderTime = (componentName: string) => {
  const measureRender = (fn: () => any) => {
    const timer = performanceMonitor.start(`render:${componentName}`);
    try {
      const result = fn();
      timer.end({});
      return result;
    } catch (error) {
      timer.end({ error: true });
      throw error;
    }
  };

  return { measureRender };
};

/**
 * Measure async operation duration
 */
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  const timer = performanceMonitor.start(name);
  try {
    const result = await fn();
    timer.end(metadata);
    return result;
  } catch (error) {
    timer.end({ ...metadata, error: true });
    throw error;
  }
};

/**
 * Debounce function for expensive operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  performanceMonitor,
  useRenderTime,
  measureAsync,
  debounce,
  throttle,
};
