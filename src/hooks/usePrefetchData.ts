/**
 * Hook para fazer prefetch de dados enquanto o usuário navega
 * Melhora significativamente o UX reduzindo loading times nas próximas screens
 */

import { useCallback, useEffect, useRef } from 'react';
import { useApiCache } from './useApiCache';
import { logger } from '../utils/logger';

interface PrefetchOptions {
  enabled?: boolean;
  delay?: number; // ms to wait before prefetch
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Hook para prefetch automático de dados baseado em contexto
 * Exemplo: quando em HomeScreen, prefetch services e therapists
 */
export function usePrefetchData(
  screenName: string,
  endpoints: Record<string, () => Promise<any>>,
  options: PrefetchOptions = {}
) {
  const {
    enabled = true,
    delay = 1000, // wait 1s after screen load
    priority = 'normal',
  } = options;

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const cacheHooksRef = useRef<any>({});

  // Create cache hooks for each endpoint
  const cacheStates = Object.entries(endpoints).reduce(
    (acc, [key, fetchFn]) => {
      const cacheKey = `${screenName}_prefetch_${key}`;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const cache = useApiCache(
        cacheKey,
        fetchFn,
        {
          ttl: 15 * 60 * 1000, // 15 minutes
          enabled: false, // Don't auto-fetch, we control timing
        }
      );
      acc[key] = cache;
      return acc;
    },
    {} as Record<string, any>
  );

  const triggerPrefetch = useCallback(async () => {
    if (!enabled) return;

    logger.debug(`Prefetch started for ${screenName}`, { priority });

    Object.entries(cacheStates).forEach(([key, cache]) => {
      const timer = setTimeout(() => {
        logger.debug(`Prefetching endpoint: ${key}`);
        cache.fetch().catch((err: Error) => {
          logger.warn(`Prefetch failed for ${key}`, err);
        });
      }, delay);

      timersRef.current.push(timer);
    });
  }, [enabled, screenName, delay, cacheStates]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  // Auto-trigger on mount (configurable)
  useEffect(() => {
    if (enabled) {
      triggerPrefetch();
    }
  }, [enabled, triggerPrefetch]);

  return {
    prefetch: triggerPrefetch,
    caches: cacheStates,
    cancelPrefetch: () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    },
  };
}

/**
 * Hook para prefetch de dados específicos com controle fino
 */
export function usePrefetch<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: PrefetchOptions = {}
) {
  const {
    enabled = true,
    delay = 500,
  } = options;

  const { fetch, isCached } = useApiCache(endpoint, fetchFn, {
    ttl: 15 * 60 * 1000,
    enabled: false,
  });

  const prefetch = useCallback(async () => {
    if (!enabled || isCached) return;

    return new Promise<void>((resolve) => {
      const timer = setTimeout(async () => {
        try {
          await fetch();
          logger.debug(`Prefetch completed for ${endpoint}`);
          resolve();
        } catch (err) {
          logger.warn(`Prefetch failed for ${endpoint}`, err as Error);
          resolve(); // Don't reject, prefetch is non-critical
        }
      }, delay);

      return () => clearTimeout(timer);
    });
  }, [endpoint, enabled, isCached, delay, fetch]);

  return { prefetch, isCached };
}

export default usePrefetchData;
