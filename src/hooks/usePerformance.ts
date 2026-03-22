/**
 * usePerformance Hook
 * Monitors component performance and renders
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  memoryUsed?: number;
}

export const usePerformance = (componentName: string): PerformanceMetrics => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });

  const mountTimeRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);

  // Measure mount time
  useEffect(() => {
    mountTimeRef.current = Date.now();
    
    return () => {
      const mountTime = Date.now() - mountTimeRef.current;
      metricsRef.current.mountTime = mountTime;
      
      logger.debug(
        `${componentName} mounted in ${mountTime}ms`,
        'Performance'
      );
    };
  }, [componentName]);

  // Track render time
  useEffect(() => {
    renderStartRef.current = Date.now();
    
    return () => {
      const renderTime = Date.now() - renderStartRef.current;
      metricsRef.current.renderTime = renderTime;
      metricsRef.current.updateCount += 1;

      if (renderTime > 16) {
        // Longer than one frame (60fps = 16ms)
        logger.warn(
          `${componentName} rendered in ${renderTime}ms (slow render)`,
          'Performance'
        );
      }
    };
  });

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      ...metricsRef.current,
      memoryUsed: (performance as any).memory?.usedJSHeapSize,
    };
  }, []);

  return getMetrics();
};

/**
 * Hook to measure async operation performance
 */
export const useAsyncPerformance = (
  operationName: string,
  operation: () => Promise<void>
): {
  execute: () => Promise<void>;
  duration: number;
  isExecuting: boolean;
} => {
  const durationRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);

  const execute = useCallback(async () => {
    try {
      isExecutingRef.current = true;
      const startTime = Date.now();

      await operation();

      durationRef.current = Date.now() - startTime;

      logger.debug(
        `${operationName} completed in ${durationRef.current}ms`,
        'Performance'
      );
    } catch (error) {
      logger.error(
        `${operationName} failed`,
        error as Error,
        'Performance'
      );
      throw error;
    } finally {
      isExecutingRef.current = false;
    }
  }, [operationName, operation]);

  return {
    execute,
    duration: durationRef.current,
    isExecuting: isExecutingRef.current,
  };
};
