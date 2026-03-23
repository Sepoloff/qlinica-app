/**
 * Lazy Loading Utilities for Code Splitting
 * Optimizes app performance by splitting large screens into separate chunks
 * React Native compatible - uses dynamic imports
 */

import { ComponentType } from 'react';

/**
 * Cache for preloaded modules
 */
const preloadCache = new Map<string, Promise<any>>();

/**
 * Preload a component module before navigation
 * @param importFunc - Async function that imports the component
 * @param cacheKey - Optional cache key for storing the preload promise
 */
export const preloadScreen = async (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  cacheKey?: string
): Promise<void> => {
  try {
    const key = cacheKey || Math.random().toString(36);
    
    if (preloadCache.has(key)) {
      return;
    }

    const promise = importFunc();
    preloadCache.set(key, promise);
    
    await promise;
  } catch (err) {
    console.warn('Failed to preload screen:', err);
  }
};

/**
 * Batch preload multiple screens
 * Call this on app startup or before high-traffic routes
 * @param importFuncs - Array of import functions
 */
export const preloadScreens = async (
  importFuncs: Array<() => Promise<{ default: ComponentType<any> }>>
): Promise<void> => {
  try {
    await Promise.all(
      importFuncs.map((importFunc, index) => 
        preloadScreen(importFunc, `screen-${index}`)
      )
    );
  } catch (err) {
    console.warn('Failed to preload screens:', err);
  }
};

/**
 * Get preloaded module from cache
 * @param cacheKey - The cache key used during preload
 */
export const getPreloadedScreen = async (
  cacheKey: string
): Promise<ComponentType<any> | null> => {
  try {
    if (!preloadCache.has(cacheKey)) {
      return null;
    }

    const module = await preloadCache.get(cacheKey);
    return module?.default || null;
  } catch (err) {
    console.error('Error getting preloaded screen:', err);
    return null;
  }
};

/**
 * Clear preload cache
 */
export const clearPreloadCache = (): void => {
  preloadCache.clear();
};

/**
 * Get cache statistics
 */
export const getPreloadCacheStats = () => {
  return {
    cachedScreens: preloadCache.size,
    keys: Array.from(preloadCache.keys()),
  };
};

export default {
  preloadScreen,
  preloadScreens,
  getPreloadedScreen,
  clearPreloadCache,
  getPreloadCacheStats,
};
