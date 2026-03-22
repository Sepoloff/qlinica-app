/**
 * Network Status Utilities
 * Detects online/offline status and handles network connectivity
 */

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { analyticsService } from '../services/analyticsService';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string; // 'wifi', 'cellular', 'none', etc.
}

/**
 * Check if the device is currently online
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return (state.isConnected ?? false) && (state.isInternetReachable !== false);
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

/**
 * React Hook to monitor network connectivity
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(connected);
      setNetworkType(state.type);

      // Track network changes in analytics
      analyticsService.trackEvent('network_status_changed', {
        isConnected: connected,
        type: state.type,
      });
    });

    // Check initial status
    checkNetworkConnection().then((connected) => {
      setIsOnline(connected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline, networkType };
};

/**
 * Retry a function with exponential backoff when offline
 */
export const retryWhileOffline = async <T,>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    timeout?: number;
  }
): Promise<T> => {
  const {
    maxRetries = 5,
    initialDelay = 1000,
    maxDelay = 30000,
    timeout = 60000,
  } = options || {};

  let lastError: Error | null = null;
  const startTime = Date.now();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if we're online
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        throw new Error('Device is offline');
      }

      // Try the function
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Function timeout')), timeout)
        ),
      ]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if total time exceeded
      if (Date.now() - startTime > timeout) {
        throw lastError;
      }

      // Calculate backoff delay
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt) + Math.random() * initialDelay,
        maxDelay
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
    }
  }

  throw lastError || new Error('All retries failed');
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code;

  return (
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('timeout') ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNABORTED'
  );
};

/**
 * Parse network error message
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (!isNetworkError(error)) {
    return 'Unknown error';
  }

  const message = error?.message?.toLowerCase() || '';

  if (message.includes('timeout')) {
    return 'Pedido expirou. Verifique a sua conexão';
  }
  if (message.includes('offline')) {
    return 'Sem conexão à internet';
  }
  if (message.includes('network')) {
    return 'Erro de conexão';
  }

  return 'Erro de rede. Tente novamente';
};
