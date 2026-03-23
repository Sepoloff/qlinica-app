/**
 * Hook para refresh inteligente que detecta mudanças reais nos dados
 * Evita re-renders desnecessários quando dados não mudaram
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';

// Use lazy import for network status hook to avoid RN deps in tests
let useNetworkStatus: any = null;
try {
  useNetworkStatus = require('./useNetworkStatus').useNetworkStatus;
} catch {
  // Fallback for tests
  useNetworkStatus = () => ({ isOnline: true });
}

interface SmartRefreshOptions {
  enabled?: boolean;
  interval?: number; // ms entre refreshes
  compareDeep?: boolean; // true = deep comparison, false = === comparison
  onDataChanged?: (oldData: any, newData: any) => void;
  onRefreshError?: (error: Error) => void;
}

/**
 * Hook para refresh inteligente com detecção de mudanças
 */
export function useSmartRefresh<T>(
  fetchFn: () => Promise<T>,
  options: SmartRefreshOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    compareDeep = true,
    onDataChanged,
    onRefreshError,
  } = options;

  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  const previousDataRef = useRef<T | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Deep comparison helper
  const hasDataChanged = useCallback((oldData: T | null, newData: T): boolean => {
    if (oldData === null) return true; // First load always counts as changed
    
    if (!compareDeep) {
      return oldData !== newData;
    }

    try {
      return JSON.stringify(oldData) !== JSON.stringify(newData);
    } catch {
      // Fallback to === if JSON serialization fails
      return oldData !== newData;
    }
  }, [compareDeep]);

  const refresh = useCallback(async (force = false) => {
    if (!enabled || (!force && !isOnline)) return;

    try {
      setIsRefreshing(true);
      const newData = await fetchFn();

      // Check if data actually changed
      const changed = hasDataChanged(previousDataRef.current, newData);
      
      if (changed) {
        const oldData = previousDataRef.current;
        previousDataRef.current = newData;
        setData(newData);
        setHasChanged(true);
        onDataChanged?.(oldData, newData);
        logger.debug('Smart refresh: data changed', { timestamp: new Date() });
      } else {
        setHasChanged(false);
        logger.debug('Smart refresh: no changes detected');
      }

      setLastRefreshTime(Date.now());
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onRefreshError?.(err);
      logger.error('Smart refresh error', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, isOnline, fetchFn, hasDataChanged, onDataChanged, onRefreshError]);

  // Auto-refresh on interval (if online)
  useEffect(() => {
    if (!enabled || !isOnline) return;

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set new interval
    refreshIntervalRef.current = setInterval(() => {
      refresh();
    }, interval);

    // Do initial refresh
    refreshTimeoutRef.current = setTimeout(() => {
      refresh();
    }, 500); // Small delay to avoid blocking initial load

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [enabled, isOnline, interval, refresh]);

  const manualRefresh = useCallback(() => {
    return refresh(true);
  }, [refresh]);

  return {
    data,
    isRefreshing,
    hasChanged,
    lastRefreshTime,
    refresh: manualRefresh,
    lastRefreshAgo: lastRefreshTime ? Date.now() - lastRefreshTime : null,
  };
}

/**
 * Hook para detectar mudanças em dados específicos
 */
export function useDataChangeDetection<T>(
  data: T,
  onChangeDetected?: (change: { before: T; after: T; timestamp: number }) => void
) {
  const previousDataRef = useRef<T>(data);
  const [changeDetected, setChangeDetected] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState<number | null>(null);

  useEffect(() => {
    try {
      const currentStr = JSON.stringify(data);
      const previousStr = JSON.stringify(previousDataRef.current);

      if (currentStr !== previousStr) {
        setChangeDetected(true);
        const now = Date.now();
        setLastChangeTime(now);
        
        onChangeDetected?.({
          before: previousDataRef.current,
          after: data,
          timestamp: now,
        });

        previousDataRef.current = data;

        // Reset changeDetected flag after 500ms
        const timeout = setTimeout(() => setChangeDetected(false), 500);
        return () => clearTimeout(timeout);
      }
    } catch (err) {
      logger.warn('Error detecting changes', err as Error);
    }
  }, [data, onChangeDetected]);

  return {
    changeDetected,
    lastChangeTime,
  };
}

export default useSmartRefresh;
