/**
 * usePerformanceTracking - Hook for tracking screen and component performance
 * Automatically measures render times and component lifecycle metrics
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

interface PerformanceTrackingOptions {
  screenName: string;
  logToConsole?: boolean;
  enabled?: boolean;
}

/**
 * Hook to track screen render performance
 * Measures time from component mount to first render
 */
export const useScreenPerformance = (options: PerformanceTrackingOptions) => {
  const { screenName, logToConsole = true, enabled = true } = options;
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const renderTime = Date.now() - mountTimeRef.current;
    renderCountRef.current++;

    if (logToConsole) {
      console.log(`📊 [${screenName}] Render ${renderCountRef.current}: ${renderTime}ms`);
    }

    performanceMonitor.recordMetric(
      `screen:${screenName}`,
      renderTime,
      { renderCount: renderCountRef.current }
    );
  }, [screenName, logToConsole, enabled]);

  return {
    getRenderCount: () => renderCountRef.current,
    getMountTime: () => mountTimeRef.current,
  };
};

/**
 * Hook to track async operation performance
 * Measures API calls, data fetching, etc.
 */
export const useAsyncPerformance = (operationName: string) => {
  const trackOperation = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      metadata?: Record<string, any>
    ): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await asyncFn();
        const duration = performance.now() - startTime;

        performanceMonitor.recordMetric(
          `async:${operationName}`,
          duration,
          { ...metadata, success: true }
        );

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        performanceMonitor.recordMetric(
          `async:${operationName}`,
          duration,
          { ...metadata, success: false, error: true }
        );

        throw error;
      }
    },
    [operationName]
  );

  return { trackOperation };
};

/**
 * Hook to measure and log component update frequency
 * Helps identify unnecessary re-renders
 */
export const useRenderCounter = (componentName: string) => {
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current++;
    console.log(`🔄 [${componentName}] Render count: ${renderCountRef.current}`);
  });

  return renderCountRef.current;
};

/**
 * Hook to measure API call performance
 * Tracks API response times and caching stats
 */
export const useApiPerformance = (endpoint: string) => {
  const trackApiCall = useCallback(
    async <T,>(apiCall: () => Promise<T>, isCached = false): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        performanceMonitor.recordMetric(
          `api:${endpoint}`,
          duration,
          { cached: isCached, success: true }
        );

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        performanceMonitor.recordMetric(
          `api:${endpoint}`,
          duration,
          { cached: isCached, success: false, error: true }
        );

        throw error;
      }
    },
    [endpoint]
  );

  return { trackApiCall };
};

export default {
  useScreenPerformance,
  useAsyncPerformance,
  useRenderCounter,
  useApiPerformance,
};
