/**
 * Caching Utilities for API Responses
 * Implements multi-level caching strategy (memory + storage)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // default: 5 minutes
  storage?: 'memory' | 'storage' | 'both';
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = '@qlinica_cache_';

/**
 * In-memory cache for frequently accessed data
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Persistent storage cache using AsyncStorage
 */
class StorageCache {
  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Failed to cache ${key} to storage:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(STORAGE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`Failed to get ${key} from storage:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.warn(`Failed to delete ${key} from storage:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear storage cache:', error);
    }
  }
}

// Instances
const memoryCache = new MemoryCache();
const storageCache = new StorageCache();

/**
 * Get cached value from memory or storage
 */
export const getCachedData = async <T>(
  key: string,
  storage: 'memory' | 'storage' | 'both' = 'both'
): Promise<T | null> => {
  // Try memory first (fastest)
  if (storage === 'memory' || storage === 'both') {
    const memoryData = memoryCache.get<T>(key);
    if (memoryData !== null) return memoryData;
  }

  // Try storage
  if (storage === 'storage' || storage === 'both') {
    const storageData = await storageCache.get<T>(key);
    if (storageData !== null) {
      // Populate memory cache for future access
      memoryCache.set(key, storageData);
      return storageData;
    }
  }

  return null;
};

/**
 * Cache data with automatic persistence
 */
export const setCachedData = async <T>(
  key: string,
  data: T,
  options?: CacheOptions
): Promise<void> => {
  const ttl = options?.ttl ?? DEFAULT_TTL;
  const storage = options?.storage ?? 'both';

  // Always cache in memory
  memoryCache.set(key, data, ttl);

  // Optionally cache in storage
  if (storage === 'storage' || storage === 'both') {
    await storageCache.set(key, data, ttl);
  }
};

/**
 * Invalidate cache entry
 */
export const invalidateCache = async (key: string, storage?: 'memory' | 'storage' | 'both') => {
  const target = storage || 'both';
  if (target === 'memory' || target === 'both') {
    memoryCache.delete(key);
  }
  if (target === 'storage' || target === 'both') {
    await storageCache.delete(key);
  }
};

/**
 * Clear all caches
 */
export const clearAllCaches = async () => {
  memoryCache.clear();
  await storageCache.clear();
};

/**
 * Wrapper for API calls with automatic caching
 */
export const cachedApiCall = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  options?: CacheOptions
): Promise<T> => {
  // Check cache first
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  try {
    // Call API
    const data = await apiCall();

    // Cache result
    await setCachedData(key, data, options);

    return data;
  } catch (error) {
    // Return stale cache on error if available
    const staleData = await getCachedData<T>(key);
    if (staleData !== null) {
      console.warn(`API call failed for ${key}, returning stale cache`);
      return staleData;
    }
    throw error;
  }
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    memory: memoryCache.getStats(),
  };
};

export default {
  getCachedData,
  setCachedData,
  invalidateCache,
  clearAllCaches,
  cachedApiCall,
  getCacheStats,
  memoryCache,
  storageCache,
};
