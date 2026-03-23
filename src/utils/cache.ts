/**
 * Caching layer for API responses
 * Supports expiration and offline fallback
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number; // TTL in ms
}

const CACHE_PREFIX = '@qlinica_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private currentSize = 0;

  /**
   * Generate cache key
   */
  private getKey(namespace: string, id: string): string {
    return `${CACHE_PREFIX}${namespace}_${id}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.expires;
  }

  /**
   * Set cache value
   */
  async set<T>(namespace: string, id: string, data: T, ttl = DEFAULT_TTL): Promise<void> {
    const key = this.getKey(namespace, id);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expires: ttl,
    };

    try {
      // Memory cache (fast)
      this.memoryCache.set(key, entry);

      // Persistent cache (async)
      const serialized = JSON.stringify(entry);
      const size = new Blob([serialized]).size;

      if (this.currentSize + size > MAX_CACHE_SIZE) {
        await this.evictOldest();
      }

      await AsyncStorage.setItem(key, serialized);
      this.currentSize += size;

      logger.debug(`💾 Cached: ${namespace}/${id}`, { ttl, size });
    } catch (error) {
      logger.warn(`Cache write failed for ${key}`, error);
    }
  }

  /**
   * Get cache value
   */
  async get<T>(namespace: string, id: string): Promise<T | null> {
    const key = this.getKey(namespace, id);

    try {
      // Check memory cache first
      const memEntry = this.memoryCache.get(key);
      if (memEntry && !this.isExpired(memEntry)) {
        logger.debug(`✓ Memory hit: ${namespace}/${id}`);
        return memEntry.data as T;
      }

      // Check persistent cache
      const stored = await AsyncStorage.getItem(key);
      if (!stored) {
        logger.debug(`✗ Cache miss: ${namespace}/${id}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(stored);
      if (this.isExpired(entry)) {
        logger.debug(`⏰ Cache expired: ${namespace}/${id}`);
        await this.remove(namespace, id);
        return null;
      }

      // Restore to memory cache
      this.memoryCache.set(key, entry);
      logger.debug(`✓ Disk hit: ${namespace}/${id}`);
      return entry.data;
    } catch (error) {
      logger.error(`Cache read failed for ${key}`, error);
      return null;
    }
  }

  /**
   * Remove cache entry
   */
  async remove(namespace: string, id: string): Promise<void> {
    const key = this.getKey(namespace, id);
    try {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(key);
      logger.debug(`🗑️  Cache removed: ${namespace}/${id}`);
    } catch (error) {
      logger.warn(`Cache removal failed for ${key}`, error);
    }
  }

  /**
   * Clear all cache for namespace
   */
  async clear(namespace: string): Promise<void> {
    try {
      const keys = Array.from(this.memoryCache.keys()).filter((k) =>
        k.includes(`_${namespace}_`)
      );

      keys.forEach((key) => this.memoryCache.delete(key));

      const allKeys = await AsyncStorage.getAllKeys();
      const nsKeys = allKeys.filter((k) => k.includes(`${CACHE_PREFIX}${namespace}_`));
      await AsyncStorage.multiRemove(nsKeys);

      logger.debug(`🗑️  Cache cleared: ${namespace}`);
    } catch (error) {
      logger.error(`Cache clear failed for ${namespace}`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      this.memoryCache.clear();
      this.currentSize = 0;

      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);

      logger.info('🗑️  All cache cleared');
    } catch (error) {
      logger.error('Clear all cache failed', error);
    }
  }

  /**
   * Evict oldest cache entry
   */
  private async evictOldest(): Promise<void> {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      if (entry) {
        const size = new Blob([JSON.stringify(entry)]).size;
        this.currentSize -= size;
      }
      this.memoryCache.delete(oldestKey);
      await AsyncStorage.removeItem(oldestKey);
      logger.debug(`♻️  Evicted oldest cache: ${oldestKey}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      currentSize: this.currentSize,
      maxSize: MAX_CACHE_SIZE,
      utilizationPercent: ((this.currentSize / MAX_CACHE_SIZE) * 100).toFixed(2),
    };
  }
}

export const cacheManager = new CacheManager();

/**
 * React hook for cached data fetching
 */
export const useCachedData = <T,>(
  namespace: string,
  id: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // Try cache first
        const cached = await cacheManager.get<T>(namespace, id);
        if (cached && mounted) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const fresh = await fetchFn();
        if (mounted) {
          setData(fresh);
          await cacheManager.set(namespace, id, fresh, ttl);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [namespace, id, fetchFn, ttl]);

  return { data, loading, error };
};
