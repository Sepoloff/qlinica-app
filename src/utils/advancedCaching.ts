/**
 * Advanced Caching System
 * Multi-layer caching with TTL, invalidation, and prefetching
 * Supports memory cache, persistent storage, and cache warming
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheConfig {
  ttl?: number; // Time to live in ms (default: 5 minutes)
  persistent?: boolean; // Save to AsyncStorage (default: false)
  maxSize?: number; // Max items in cache (default: 100)
  warmOnInit?: boolean; // Prefetch on initialization (default: false)
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  persistent: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 300000, // 5 minutes
  persistent: false,
  maxSize: 100,
  warmOnInit: false,
};

const STORAGE_PREFIX = '@qlinica_cache_';

class AdvancedCache<T = any> {
  private memoryCache: Map<string, CacheEntry<T>> = new Map();
  private config: Required<CacheConfig>;
  private metrics: CacheMetrics = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private cleanupInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(key: string, value: T | null) => void> = [];

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);

    if (memEntry) {
      if (!this.isExpired(memEntry)) {
        this.metrics.hits++;
        return memEntry.value;
      } else {
        // Expired in memory
        this.memoryCache.delete(key);
      }
    }

    // Check persistent storage if enabled
    if (this.config.persistent) {
      try {
        const stored = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (stored) {
          const entry = JSON.parse(stored) as CacheEntry<T>;

          if (!this.isExpired(entry)) {
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            this.updateMetrics();
            this.metrics.hits++;
            return entry.value;
          } else {
            // Expired in storage
            await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
          }
        }
      } catch (error) {
        console.error(`Error retrieving cached value for ${key}:`, error);
      }
    }

    this.metrics.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const entryTtl = ttl || this.config.ttl;
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: entryTtl,
      persistent: this.config.persistent,
    };

    // Check size limits
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store persistently if enabled
    if (this.config.persistent) {
      try {
        await AsyncStorage.setItem(
          `${STORAGE_PREFIX}${key}`,
          JSON.stringify(entry),
        );
      } catch (error) {
        console.error(`Error caching value for ${key}:`, error);
      }
    }

    this.updateMetrics();
    this.notifyListeners(key, value);
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.metrics.evictions++;

      if (this.config.persistent) {
        AsyncStorage.removeItem(`${STORAGE_PREFIX}${oldestKey}`).catch((err) => {
          console.error(`Error removing cached value for ${oldestKey}:`, err);
        });
      }
    }
  }

  /**
   * Remove specific key
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.config.persistent) {
      try {
        await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch (error) {
        console.error(`Error removing cached value for ${key}:`, error);
      }
    }

    this.notifyListeners(key, null);
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0, size: 0 };

    if (this.config.persistent) {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.memoryCache.size;
  }

  /**
   * Check if key exists and is valid
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(listener: (key: string, value: T | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(key: string, value: T | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(key, value);
      } catch (error) {
        console.error('Error notifying cache listener:', error);
      }
    });
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.size = this.memoryCache.size;
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000); // Run every minute
  }

  /**
   * Clean expired entries
   */
  private cleanExpiredEntries(): void {
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        cleaned++;

        if (this.config.persistent) {
          AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`).catch((err) => {
            console.error(`Error removing expired cache entry ${key}:`, err);
          });
        }
      }
    }

    if (cleaned > 0) {
      this.updateMetrics();
      console.log(`[Cache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.listeners = [];
  }
}

// Export singleton instances for common cache needs
export const apiResponseCache = new AdvancedCache({
  ttl: 300000, // 5 minutes
  persistent: true,
  maxSize: 100,
});

export const userDataCache = new AdvancedCache({
  ttl: 600000, // 10 minutes
  persistent: true,
  maxSize: 50,
});

export const sessionCache = new AdvancedCache({
  ttl: 1800000, // 30 minutes
  persistent: false,
  maxSize: 20,
});

export default AdvancedCache;
