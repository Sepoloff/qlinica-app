import { useEffect, useState, useRef } from 'react';

interface UseFetchOptions {
  skip?: boolean;
  retryCount?: number;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for data fetching with error handling and retry logic
 */
export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchResult<T> => {
  const { skip = false, retryCount: maxRetries = 3, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);
  
  const retries = useRef(0);
  const isMounted = useRef(true);

  const fetchData = async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn();
      
      if (isMounted.current) {
        setData(result);
        retries.current = 0;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (retries.current < maxRetries) {
        retries.current++;
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, retries.current - 1);
        setTimeout(fetchData, delay);
      } else {
        if (isMounted.current) {
          setError(error);
        }
        onError?.(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const refetch = async () => {
    retries.current = 0;
    await fetchData();
  };

  return { data, loading, error, refetch };
};
