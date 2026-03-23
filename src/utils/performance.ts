/**
 * Performance utilities for monitoring and optimization
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from './logger';

/**
 * Measure function execution time
 */
export const measurePerformance = async <T,>(
  fn: () => Promise<T>,
  label: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.info(`⚡ ${label} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`❌ ${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Debounce function for expensive operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function for continuous events
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartRef = useRef(performance.now());

  useEffect(() => {
    const renderEnd = performance.now();
    const duration = renderEnd - renderStartRef.current;
    
    if (duration > 16) { // > 16ms is janky on 60fps
      logger.warn(`🐌 ${componentName} render took ${duration.toFixed(2)}ms`, {
        component: componentName,
        duration,
      });
    }
  }, [componentName]);
};

/**
 * Memoization utility for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Batch updates for React state
 */
export const batchUpdates = (updates: (() => void)[]) => {
  updates.forEach(update => update());
};
