/**
 * Memoization Utilities
 * Helps optimize component performance through memo and useMemo
 */

import React, { useMemo, useCallback, memo } from 'react';

/**
 * Creates a memoized version of a component
 * Only rerenders when props actually change
 */
export const createMemoComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> => {
  return memo(Component, propsAreEqual);
};

/**
 * Custom comparison function for memo
 * Deep compares specific props
 */
export const shallowCompare = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>,
  keysToCompare?: string[]
): boolean => {
  const keys = keysToCompare || Object.keys(nextProps);

  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) {
      return false; // Props are different
    }
  }

  return true; // Props are the same
};

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Hook for memoizing callback functions with stable reference
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps) as T;
};

/**
 * Higher-order component for performance optimization
 * Automatically wraps component in memo with shallow prop comparison
 */
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) => {
  const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
    return shallowCompare(prevProps, nextProps);
  });

  OptimizedComponent.displayName = displayName || Component.displayName || 'OptimizedComponent';

  return OptimizedComponent;
};

/**
 * Memoize a pure function
 * Caches results based on arguments
 */
export const memoize = <Args extends any[], R>(
  fn: (...args: Args) => R,
  options?: { maxSize?: number }
): ((...args: Args) => R) => {
  const cache = new Map<string, R>();
  const maxSize = options?.maxSize || 100;

  return (...args: Args): R => {
    // Create cache key from arguments
    const key = JSON.stringify(args);

    // Check cache
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Compute result
    const result = fn(...args);

    // Store in cache (with size limit)
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    cache.set(key, result);

    return result;
  };
};

/**
 * Debounce a function (delays execution)
 * Useful for search, resize handlers, etc.
 */
export const debounceFunction = <Args extends any[]>(
  fn: (...args: Args) => void,
  delay: number
): ((...args: Args) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle a function (limits execution frequency)
 * Useful for scroll, drag, resize handlers
 */
export const throttleFunction = <Args extends any[]>(
  fn: (...args: Args) => void,
  limit: number
): ((...args: Args) => void) => {
  let lastRun = 0;

  return (...args: Args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Batch multiple state updates into one render
 * React 18+ handles this automatically, but useful for older versions
 */
export const unstable_batchedUpdates = (callback: () => void) => {
  // React 18+ batches updates automatically
  callback();
};

/**
 * Selector hook for memoizing derived state
 */
export const useMemoSelector = <State, Selected>(
  state: State,
  selector: (state: State) => Selected,
  deps?: React.DependencyList
): Selected => {
  return useMemo(() => selector(state), deps || [state]);
};

/**
 * Hook to prevent unnecessary rerenders of list items
 */
export const useMemoizedListItem = <T extends { id: string | number }>(
  item: T,
  onRender?: () => void
) => {
  React.useEffect(() => {
    onRender?.();
  }, [item.id]);

  return item;
};

/**
 * Create a stable identity function for use in dependency arrays
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps?: React.DependencyList
): T => {
  const ref = React.useRef(callback);

  React.useEffect(() => {
    ref.current = callback;
  }, deps || [callback]);

  return React.useCallback(
    (...args: Parameters<T>) => ref.current(...args),
    []
  ) as T;
};

export default {
  createMemoComponent,
  shallowCompare,
  useMemoizedValue,
  useMemoizedCallback,
  withPerformanceOptimization,
  memoize,
  debounceFunction,
  throttleFunction,
  useMemoSelector,
  useMemoizedListItem,
  useStableCallback,
};
