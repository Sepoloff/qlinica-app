/**
 * Performance Utilities
 * Helps optimize component rendering and data handling
 */

import React, { useCallback, useRef, useMemo, useEffect } from 'react';

/**
 * Debounce a function call
 * Useful for search inputs, form validation, API calls
 */
export const useDebounce = <T extends any[], R>(
  fn: (...args: T) => R,
  delay: number = 300
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
};

/**
 * Throttle a function call
 * Useful for scroll events, window resize
 */
export const useThrottle = <T extends any[], R>(
  fn: (...args: T) => R,
  delay: number = 300
) => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        fn(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          fn(...args);
          timeoutRef.current = undefined;
        }, delay - timeSinceLastCall);
      }
    },
    [fn, delay]
  );
};

/**
 * Memoize expensive calculations
 */
export const useMemoComputation = <T,>(
  compute: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = compute();
    const endTime = performance.now();

    if (__DEV__ && endTime - startTime > 16) {
      console.warn(
        `⚠️ Expensive computation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }

    return result;
  }, deps);
};

/**
 * Track component render performance
 */
export const useRenderTracking = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    if (__DEV__) {
      console.log(
        `📊 ${componentName} rendered (#${renderCountRef.current}) - ${timeSinceLastRender}ms since last`
      );
    }
  });

  return {
    renderCount: renderCountRef.current,
    timeSinceLastRender: Date.now() - lastRenderTimeRef.current,
  };
};

/**
 * Measure component performance (HOC)
 */
export const withPerformanceTracking = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string = (Component as any).displayName || (Component as any).name || 'Component'
) => {
  const Wrapper = (props: P) => {
    const renderTracking = useRenderTracking(componentName);
    return (Component as any)(props);
  };
  Wrapper.displayName = `withPerformanceTracking(${componentName})`;
  return Wrapper;
};

/**
 * Lazy load images with blur placeholder
 */
export const useImageLoader = (imageUrl: string | null | undefined) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoaded(false);
      return;
    }

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = (e) => setError(new Error(String(e)));
    img.src = imageUrl;
  }, [imageUrl]);

  return { isLoaded, error };
};

/**
 * Cache API responses with TTL
 */
export const useCacheWithTTL = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000 // 1 minute default
) => {
  const cacheRef = useRef<Map<string, { data: T; expiresAt: number }>>(new Map());
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetch = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      setData(cached.data);
      return cached.data;
    }

    setLoading(true);
    try {
      const result = await fetcher();
      cacheRef.current.set(key, { data: result, expiresAt: Date.now() + ttl });
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  return { data, loading, error, fetch };
};

/**
 * Measure async operation duration
 */
export const measureAsyncOperation = async <T,>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    if (__DEV__) {
      console.log(`⏱️  ${name} completed in ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
