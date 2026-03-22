import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Simple in-memory cache hook
 * Useful for caching API responses for the duration of the app session
 */
export const useCache = <T,>(ttl: number = 5 * 60 * 1000) => {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const set = useCallback(
    (key: string, data: T) => {
      cacheRef.current.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
    },
    [ttl]
  );

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getOrFetch = useCallback(
    async (key: string, fetchFn: () => Promise<T>): Promise<T> => {
      const cached = get(key);
      if (cached) {
        return cached;
      }

      const data = await fetchFn();
      set(key, data);
      return data;
    },
    [get, set]
  );

  return {
    get,
    set,
    has,
    remove,
    clear,
    getOrFetch,
  };
};

/**
 * Global cache instance for sharing across components
 */
let globalCache: Map<string, CacheEntry<any>> = new Map();

export const useGlobalCache = <T,>(ttl: number = 5 * 60 * 1000) => {
  const set = useCallback(
    (key: string, data: T) => {
      globalCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
    },
    [ttl]
  );

  const get = useCallback((key: string): T | null => {
    const entry = globalCache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      globalCache.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  const remove = useCallback((key: string) => {
    globalCache.delete(key);
  }, []);

  const clear = useCallback(() => {
    globalCache.clear();
  }, []);

  const getOrFetch = useCallback(
    async (key: string, fetchFn: () => Promise<T>): Promise<T> => {
      const cached = get(key);
      if (cached) {
        return cached;
      }

      const data = await fetchFn();
      set(key, data);
      return data;
    },
    [get, set]
  );

  return {
    get,
    set,
    has,
    remove,
    clear,
    getOrFetch,
  };
};
