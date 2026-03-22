/**
 * useOfflineQueue Hook
 * Integrates offline queue functionality with component lifecycle
 */

import { useEffect, useCallback, useState } from 'react';
import { useNetworkStatus } from '../utils/networkStatus';
import { offlineQueueService, QueuedRequest } from '../services/offlineQueue';
import { api } from '../config/api';
import { logger } from '../utils/logger';

export interface OfflineQueueStats {
  total: number;
  byMethod: Record<string, number>;
  byPriority: Record<string, number>;
  oldestTimestamp: number | null;
}

export const useOfflineQueue = () => {
  const { isOnline } = useNetworkStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<OfflineQueueStats>({
    total: 0,
    byMethod: {},
    byPriority: {},
    oldestTimestamp: null,
  });

  // Initialize queue on mount
  useEffect(() => {
    const init = async () => {
      try {
        await offlineQueueService.initialize();
        updateStats();
      } catch (error) {
        logger.error(
          'Error initializing offline queue',
          error as Error,
          'useOfflineQueue'
        );
      }
    };

    init();
  }, []);

  // Update stats whenever we need them
  const updateStats = useCallback(() => {
    setStats(offlineQueueService.getStats());
  }, []);

  // Process queue when connection is restored
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const processQueue = async () => {
      setIsProcessing(true);
      try {
        const result = await offlineQueueService.processQueue(
          async (request: QueuedRequest) => {
            try {
              const config: any = {
                method: request.method.toLowerCase(),
                url: request.endpoint,
              };

              if (request.data) {
                config.data = request.data;
              }

              // Make the request using the configured API
              const response = await api(config);
              return response.status >= 200 && response.status < 300;
            } catch (error) {
              logger.warn(
                `Failed to process queued request: ${request.method} ${request.endpoint}`,
                error as Error,
                'useOfflineQueue'
              );
              return false;
            }
          }
        );

        if (result.successful > 0) {
          logger.debug(
            `Processed ${result.successful} queued requests`,
            'useOfflineQueue'
          );
        }

        if (result.failed > 0) {
          logger.warn(
            `${result.failed} queued requests failed after retries`,
            'useOfflineQueue'
          );
        }

        updateStats();
      } catch (error) {
        logger.error(
          'Error processing offline queue',
          error as Error,
          'useOfflineQueue'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processQueue();
  }, [isOnline, updateStats]);

  // Queue a new request
  const queueRequest = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      endpoint: string,
      data?: any,
      priority: 'high' | 'normal' | 'low' = 'normal'
    ) => {
      try {
        const request = await offlineQueueService.addToQueue(
          method,
          endpoint,
          data,
          priority
        );
        updateStats();
        return request;
      } catch (error) {
        logger.error(
          `Error queuing request: ${method} ${endpoint}`,
          error as Error,
          'useOfflineQueue'
        );
        throw error;
      }
    },
    [updateStats]
  );

  // Get current queue
  const getQueue = useCallback(() => {
    return offlineQueueService.getQueue();
  }, []);

  // Clear queue
  const clearQueue = useCallback(async () => {
    try {
      await offlineQueueService.clearQueue();
      updateStats();
    } catch (error) {
      logger.error(
        'Error clearing offline queue',
        error as Error,
        'useOfflineQueue'
      );
      throw error;
    }
  }, [updateStats]);

  return {
    isOnline,
    isProcessing,
    stats,
    queueRequest,
    getQueue,
    clearQueue,
    updateStats,
  };
};
