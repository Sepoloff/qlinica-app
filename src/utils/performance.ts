/**
 * Performance Utilities
 * Helps optimize component rendering and data handling
 */

import { useCallback, useRef, useMemo, useEffect } from 'react';

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
      } else {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          fn(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [fn, delay]
  );
};

/**
 * Memoize expensive calculations
 */
export const useMemoComputation = <T>(
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
 * Track rendering performance
 */
export const useRenderTracking = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
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
 * Measure component performance
 */
export const withPerformanceTracking = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name || 'Component'
) => {
  return React.memo((props: P) => {
    const renderTracking = useRenderTracking(componentName);

    return <Component {...props} />;
  });
};

/**
 * Lazy load images with blur placeholder
 */
export const useImageLoader = (imageUrl: string | null | undefined) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const onError = useCallback((error: Error) => {
    setError(error);
  }, []);

  return {
    isLoaded,
    error,
    onLoad,
    onError,
    shouldShow: isLoaded || !error,
  };
};

/**
 * Batch multiple state updates
 * Reduces re-renders by batching updates together
 */
export const useBatchState = <T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] => {
  const [state, setState] = React.useState<T>(initialState);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return [state, batchUpdate];
};

/**
 * Invalidate and revalidate cache
 * Useful for managing cache invalidation
 */
export const createCacheManager = () => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

  return {
    set: (key: string, data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
    },

    get: (key: string) => {
      const item = cache.get(key);
      if (!item) return null;

      const isExpired = Date.now() - item.timestamp > MAX_CACHE_AGE;
      if (isExpired) {
        cache.delete(key);
        return null;
      }

      return item.data;
    },

    invalidate: (key: string) => {
      cache.delete(key);
    },

    invalidateAll: () => {
      cache.clear();
    },

    size: () => cache.size,
  };
};

/**
 * List virtualization helper for long lists
 * Prevents rendering all items, only visible ones
 */
export const useVirtualizedList = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollOffset, setScrollOffset] = React.useState(0);

  const visibleStartIndex = Math.floor(scrollOffset / itemHeight);
  const visibleEndIndex = Math.ceil(
    (scrollOffset + containerHeight) / itemHeight
  );

  const visibleItems = React.useMemo(() => {
    return items.slice(
      Math.max(0, visibleStartIndex - 5),
      Math.min(items.length, visibleEndIndex + 5)
    );
  }, [items, visibleStartIndex, visibleEndIndex]);

  return {
    visibleItems,
    scrollOffset,
    setScrollOffset,
    startIndex: Math.max(0, visibleStartIndex - 5),
  };
};

/**
 * Performance metrics collector
 */
export const createMetricsCollector = () => {
  const metrics: Record<string, number[]> = {};

  return {
    mark: (name: string, value: number) => {
      if (!metrics[name]) {
        metrics[name] = [];
      }
      metrics[name].push(value);
    },

    measure: <T,>(name: string, fn: () => T): T => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      this.mark(name, end - start);
      return result;
    },

    getMetrics: (name: string) => {
      const values = metrics[name] || [];
      if (values.length === 0) return null;

      return {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        sum: values.reduce((a, b) => a + b, 0),
      };
    },

    getAllMetrics: () => {
      return Object.entries(metrics).reduce(
        (acc, [name, values]) => {
          if (values.length > 0) {
            acc[name] = {
              count: values.length,
              min: Math.min(...values),
              max: Math.max(...values),
              avg: values.reduce((a, b) => a + b, 0) / values.length,
            };
          }
          return acc;
        },
        {} as Record<string, any>
      );
    },

    reset: (name?: string) => {
      if (name) {
        delete metrics[name];
      } else {
        Object.keys(metrics).forEach((key) => delete metrics[key]);
      }
    },
  };
};
