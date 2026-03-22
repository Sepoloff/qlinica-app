/**
 * Performance Monitoring Service
 * Tracks app performance metrics and bottlenecks
 */

export interface PerformanceMetrics {
  screenRenderTime: number; // ms
  apiResponseTime: number; // ms
  navigationTime: number; // ms
  memoryUsage: number; // MB
  bundleSize: number; // KB
}

export interface ScreenMetrics {
  screenName: string;
  renderTime: number; // ms
  navigationTime: number; // ms
  componentCount: number;
  rerenderCount: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private entries: Map<string, PerformanceEntry> = new Map();
  private screenMetrics: ScreenMetrics[] = [];
  private isEnabled = true;
  private readonly MAX_ENTRIES = 1000;

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.entries.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End measuring and get duration
   */
  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    const entry = this.entries.get(name);
    if (!entry) {
      console.warn(`Performance measure not found: ${name}`);
      return null;
    }

    const duration = performance.now() - entry.startTime;
    entry.duration = duration;

    // Clean up old entries if too many
    if (this.entries.size > this.MAX_ENTRIES) {
      const oldestKey = Array.from(this.entries.keys())[0];
      this.entries.delete(oldestKey);
    }

    return duration;
  }

  /**
   * Get duration of a measurement
   */
  getDuration(name: string): number | null {
    const entry = this.entries.get(name);
    return entry?.duration || null;
  }

  /**
   * Measure screen render performance
   */
  measureScreenRender(screenName: string, duration: number): void {
    if (!this.isEnabled) return;

    const existing = this.screenMetrics.find(m => m.screenName === screenName);
    if (existing) {
      existing.renderTime = duration;
    } else {
      this.screenMetrics.push({
        screenName,
        renderTime: duration,
        navigationTime: 0,
        componentCount: 0,
        rerenderCount: 0,
      });
    }

    // Warn if render time is slow
    if (duration > 1000) {
      console.warn(`⚠️ Slow screen render: ${screenName} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Measure API response time
   */
  measureAPICall(endpoint: string, duration: number, status?: number): void {
    if (!this.isEnabled) return;

    const entryName = `api_${endpoint}_${status || 'unknown'}`;
    this.entries.set(entryName, {
      name: entryName,
      startTime: 0,
      duration,
      metadata: { endpoint, status },
    });

    // Warn if slow
    if (duration > 5000) {
      console.warn(`⚠️ Slow API call: ${endpoint} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Get all screen metrics
   */
  getScreenMetrics(): ScreenMetrics[] {
    return [...this.screenMetrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalMeasurements: number;
    averageScreenTime: number;
    slowestScreen: ScreenMetrics | null;
  } {
    const totalMeasurements = this.entries.size;
    const avgScreenTime =
      this.screenMetrics.length > 0
        ? this.screenMetrics.reduce((sum, m) => sum + m.renderTime, 0) /
          this.screenMetrics.length
        : 0;

    const slowestScreen =
      this.screenMetrics.length > 0
        ? this.screenMetrics.reduce((slowest, m) =>
            m.renderTime > slowest.renderTime ? m : slowest
          )
        : null;

    return {
      totalMeasurements,
      averageScreenTime: Math.round(averageScreenTime * 100) / 100,
      slowestScreen,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.entries.clear();
    this.screenMetrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Log all metrics to console
   */
  logMetrics(): void {
    console.log('📊 Performance Metrics:', {
      summary: this.getSummary(),
      screens: this.screenMetrics,
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export const useRenderMetrics = (screenName: string) => {
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    performanceMonitor.measureScreenRender(screenName, renderTime);
  }, [screenName]);
};

// Import React for hook
import React from 'react';
