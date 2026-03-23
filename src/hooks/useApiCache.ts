/**
 * Hook for managing API caching with automatic TTL
 * Integrates with performance monitoring
 */

import { useCallback, useEffect, useState } from 'react';
import { getCachedData, setCachedData, invalidateCache } from '../utils/caching';
import { useApiPerformance } from './usePerformanceTracking';
import { logger } from '../utils/logger';

interface UseCacheOptions {
  ttl?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

/**
 * Hook for cached API calls with performance tracking
 */
export function useApiCache<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // default 5 minutes
    enabled = true,
    onError,
    onSuccess,
  } = options;

  const { trackApiCall } = useApiPerformance(endpoint);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetch = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (!forceRefresh) {
          const cached = await getCachedData<T>(endpoint);
          if (cached !== null) {
            logger.debug(`Cache hit for ${endpoint}`);
            setData(cached);
            setIsCached(true);
            onSuccess?.(cached);
            return cached;
          }
        }

        // Fetch from API with performance tracking
        const result = await trackApiCall(fetchFn, !forceRefresh);

        // Store in cache
        await setCachedData(endpoint, result, { ttl });
        setData(result);
        setIsCached(false);
        onSuccess?.(result);

        logger.debug(`API call to ${endpoint} completed successfully`);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        logger.error(`API call to ${endpoint} failed`, error);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, enabled, ttl, trackApiCall, onError, onSuccess]
  );

  // Auto fetch on mount
  useEffect(() => {
    if (enabled && !data && !loading) {
      fetch();
    }
  }, [enabled, fetch, data, loading]);

  return {
    data,
    loading,
    error,
    isCached,
    fetch,
    refetch: () => fetch(true), // Force refresh
    clear: () => invalidateCache(endpoint),
  };
}

/**
 * Hook for managing multiple cached endpoints
 */
export function useMultiApiCache<T extends Record<string, any>>(
  endpoints: Record<keyof T, () => Promise<T[keyof T]>>,
  options: UseCacheOptions = {}
) {
  const [allData, setAllData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const fetch = useCallback(async () => {
    setLoading(true);
    const newData: Partial<T> = {};
    const newErrors: Record<string, Error> = {};

    await Promise.all(
      Object.entries(endpoints).map(async ([key, fetchFn]) => {
        try {
          const cached = await getCachedData<any>(key);
          if (cached !== null) {
            newData[key as keyof T] = cached;
            return;
          }

          const result = await fetchFn();
          newData[key as keyof T] = result;
          await setCachedData(key, result, { ttl: options.ttl || 5 * 60 * 1000 });
        } catch (err) {
          newErrors[key] = err instanceof Error ? err : new Error(String(err));
        }
      })
    );

    setAllData(newData);
    setErrors(newErrors);
    setLoading(false);
  }, [endpoints, options.ttl]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetch();
    }
  }, [fetch, options.enabled]);

  return {
    data: allData,
    loading,
    errors,
    refetch: () => fetch(),
    clear: (key?: string) => {
      if (key) {
        invalidateCache(key);
      } else {
        Object.keys(endpoints).forEach((k) => invalidateCache(k));
      }
    },
  };
}

export default useApiCache;
