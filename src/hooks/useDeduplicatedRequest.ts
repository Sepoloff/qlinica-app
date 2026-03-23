/**
 * Hook para deduplicar requisições simultâneas para o mesmo endpoint
 * Se 2+ componentes requisitarem o mesmo endpoint ao mesmo tempo,
 * apenas 1 requisição é feita e o resultado é compartilhado
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';

// Global store para requisições em andamento
const pendingRequests = new Map<
  string,
  Promise<any> & { count: number }
>();

interface DeduplicationOptions {
  enabled?: boolean;
  timeout?: number; // Remove pending request after timeout
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook que compartilha requisições simultâneas para o mesmo endpoint
 * Reduz carga no servidor e melhora performance
 */
export function useDeduplicatedRequest<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: DeduplicationOptions = {}
) {
  const {
    enabled = true,
    timeout = 30000, // 30 seconds
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDeduplicated, setIsDeduplicated] = useState(false);

  const requestPromiseRef = useRef<Promise<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async (): Promise<T | null> => {
    if (!enabled) {
      try {
        const result = await fetchFn();
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      }
    }

    // Check if there's already a pending request for this endpoint
    const existing = pendingRequests.get(endpoint);
    if (existing) {
      logger.debug(`Request deduplicated for ${endpoint}`);
      setIsDeduplicated(true);
      setLoading(true);

      try {
        const result = await existing;
        setData(result);
        setError(null);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    }

    // Create new request
    setLoading(true);
    setIsDeduplicated(false);

    const promise = (async () => {
      try {
        logger.debug(`New request initiated for ${endpoint}`);
        const result = await fetchFn();
        setData(result);
        setError(null);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
        // Cleanup pending request
        timeoutRef.current = setTimeout(() => {
          pendingRequests.delete(endpoint);
        }, 0);
      }
    })();

    // Store promise with reference count
    (promise as any).count = 1;
    pendingRequests.set(endpoint, promise as any);
    requestPromiseRef.current = promise;

    return promise;
  }, [endpoint, fetchFn, enabled, onSuccess, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-cleanup pending requests after timeout
  useEffect(() => {
    if (!enabled) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      pendingRequests.forEach((promise, key) => {
        // Check if promise is settled (resolved or rejected)
        Promise.race([promise, Promise.reject()])
          .then(() => {
            // Settled, safe to remove
          })
          .catch(() => {
            // Still pending after timeout, remove it
            if (key.includes('_timeout')) {
              pendingRequests.delete(key);
            }
          });
      });
    }, timeout);

    return () => clearInterval(cleanupInterval);
  }, [enabled, timeout]);

  return {
    data,
    loading,
    error,
    isDeduplicated,
    fetch,
    clearCache: () => {
      pendingRequests.delete(endpoint);
      setData(null);
      setError(null);
    },
    getPendingCount: () => pendingRequests.size,
  };
}

/**
 * Hook para gerenciar múltiplas requisições deduplicas
 */
export function useMultiDeduplicatedRequests<
  T extends Record<string, any>
>(
  endpoints: Record<keyof T, () => Promise<T[keyof T]>>,
  options: DeduplicationOptions = {}
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
          // Check for pending request
          const existing = pendingRequests.get(key);
          if (existing) {
            const result = await existing;
            newData[key as keyof T] = result;
            return;
          }

          // Create new request
          const promise = fetchFn() as any;
          promise.count = 1;
          pendingRequests.set(key, promise);

          const result = await promise;
          newData[key as keyof T] = result;
          
          // Cleanup
          setTimeout(() => pendingRequests.delete(key), 0);
        } catch (err) {
          newErrors[key] = err instanceof Error ? err : new Error(String(err));
        }
      })
    );

    setAllData(newData);
    setErrors(newErrors);
    setLoading(false);
  }, [endpoints]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetch();
    }
  }, [fetch, options.enabled]);

  return {
    data: allData,
    loading,
    errors,
    refetch: fetch,
    clearAll: () => {
      Object.keys(endpoints).forEach((k) => {
        pendingRequests.delete(k);
      });
      setAllData({});
      setErrors({});
    },
  };
}

/**
 * Utility para limpar todas as requisições deduplicas
 */
export function clearAllPendingRequests() {
  logger.debug(`Clearing ${pendingRequests.size} pending requests`);
  pendingRequests.clear();
}

/**
 * Utility para inspecionar estado das requisições
 */
export function getPendingRequestsInfo() {
  return {
    count: pendingRequests.size,
    endpoints: Array.from(pendingRequests.keys()),
  };
}

export default useDeduplicatedRequest;
