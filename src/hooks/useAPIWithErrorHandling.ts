/**
 * useAPIWithErrorHandling Hook
 * Integrates error message system with API calls
 * Provides automatic error message generation and retry logic
 */

import { useCallback, useState } from 'react';
import { useOfflineQueue } from './useOfflineQueue';
import { useNetworkStatus } from '../utils/networkStatus';
import { getErrorInfo } from '../utils/errorMessages';
import { logger } from '../utils/logger';

export interface APICallResult<T> {
  data: T | null;
  error: string | null;
  suggestion: string | null;
  isRetryable: boolean;
  isLoading: boolean;
}

export const useAPIWithErrorHandling = () => {
  const { addToQueue } = useOfflineQueue();
  const { isOnline } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Make an API call with automatic error handling
   */
  const callAPI = useCallback(
    async <T,>(
      apiFunction: () => Promise<T>,
      options?: {
        onError?: (error: string, suggestion: string) => void;
        retryable?: boolean;
        queueOffline?: boolean;
      }
    ): Promise<APICallResult<T>> => {
      setIsLoading(true);
      const { onError, retryable = true, queueOffline = true } = options || {};

      try {
        const data = await apiFunction();
        return {
          data,
          error: null,
          suggestion: null,
          isRetryable: false,
          isLoading: false,
        };
      } catch (error) {
        // Get structured error info
        const errorInfo = getErrorInfo(error);

        // Call error callback if provided
        if (onError) {
          onError(errorInfo.userMessage, errorInfo.suggestion);
        }

        // Log error
        logger.error(
          `API call failed: ${errorInfo.userMessage}`,
          error instanceof Error ? error : new Error(String(error))
        );

        // Queue for retry if offline and queueOffline enabled
        if (!isOnline && queueOffline && errorInfo.isRetryable) {
          logger.debug(
            `Queueing request for later processing`
          );
        }

        return {
          data: null,
          error: errorInfo.userMessage,
          suggestion: errorInfo.suggestion,
          isRetryable: errorInfo.isRetryable && retryable,
          isLoading: false,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline, addToQueue]
  );

  /**
   * Make an API call with retry logic
   */
  const callAPIWithRetry = useCallback(
    async <T,>(
      apiFunction: () => Promise<T>,
      options?: {
        maxRetries?: number;
        retryDelay?: number;
        backoffMultiplier?: number;
        onError?: (error: string, suggestion: string) => void;
      }
    ): Promise<APICallResult<T>> => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        backoffMultiplier = 2,
        onError,
      } = options || {};

      let lastError = null;
      let delay = retryDelay;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const data = await apiFunction();
          return {
            data,
            error: null,
            suggestion: null,
            isRetryable: false,
            isLoading: false,
          };
        } catch (error) {
          lastError = error;
          const errorInfo = getErrorInfo(error);

          // Don't retry non-retryable errors
          if (!errorInfo.isRetryable) {
            if (onError) {
              onError(errorInfo.userMessage, errorInfo.suggestion);
            }

            return {
              data: null,
              error: errorInfo.userMessage,
              suggestion: errorInfo.suggestion,
              isRetryable: false,
              isLoading: false,
            };
          }

          // If this was the last attempt, return error
          if (attempt === maxRetries) {
            if (onError) {
              onError(
                `${errorInfo.userMessage} (após ${maxRetries} tentativas)`,
                errorInfo.suggestion
              );
            }

            logger.error(
              `API call failed after ${maxRetries} retries`,
              error instanceof Error ? error : new Error(String(error))
            );

            return {
              data: null,
              error: `${errorInfo.userMessage} (após ${maxRetries} tentativas)`,
              suggestion: errorInfo.suggestion,
              isRetryable: true,
              isLoading: false,
            };
          }

          // Wait before retrying with exponential backoff
          logger.debug(
            `Retrying API call (${attempt + 1}/${maxRetries}) after ${delay}ms`,
            'useAPIWithRetry'
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        }
      }

      // Should not reach here, but handle just in case
      return {
        data: null,
        error: 'API call failed',
        suggestion: 'Tente novamente',
        isRetryable: true,
        isLoading: false,
      };
    },
    []
  );

  return {
    isLoading,
    isOnline,
    callAPI,
    callAPIWithRetry,
  };
};
