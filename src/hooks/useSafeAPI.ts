import { useState, useCallback, useRef } from 'react';
import { api } from '../config/api';

interface UseSafeAPIOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

interface UseSafeAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useSafeAPI = <T = any,>(options: UseSafeAPIOptions = {}) => {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<UseSafeAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const retryCount = useRef(0);

  const request = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      retryCount.current = 0;

      const executeRequest = async (): Promise<T | null> => {
        try {
          const data = await fn();
          setState({ data, loading: false, error: null });
          onSuccess?.(data);
          return data;
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            'Erro ao processar solicitação';

          // Retry on network errors or 5xx
          const shouldRetry =
            (!err.response || err.response.status >= 500) &&
            retryCount.current < maxRetries;

          if (shouldRetry) {
            retryCount.current++;
            console.log(
              `Retry ${retryCount.current}/${maxRetries} after ${retryDelay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return executeRequest();
          }

          setState({ data: null, loading: false, error: errorMessage });
          onError?.(err);
          return null;
        }
      };

      return executeRequest();
    },
    [maxRetries, retryDelay, onError, onSuccess]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    request,
    reset,
  };
};

// Hook for GET requests with caching
export const useFetchData = <T = any,>(
  url: string,
  options: UseSafeAPIOptions = {}
) => {
  const api_hook = useSafeAPI<T>(options);
  const [isFetched, setIsFetched] = useState(false);

  const fetch = useCallback(async () => {
    if (isFetched && api_hook.data) return api_hook.data;

    const data = await api_hook.request(() =>
      api.get(url).then((res) => res.data)
    );

    if (data) setIsFetched(true);
    return data;
  }, [url, isFetched, api_hook]);

  return {
    ...api_hook,
    fetch,
  };
};

// Hook for POST requests
export const usePostData = <T = any,>(options: UseSafeAPIOptions = {}) => {
  return useSafeAPI<T>(options);
};
