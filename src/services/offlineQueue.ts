/**
 * Offline Queue Service
 * Queues API requests when offline and processes them when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: any;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
}

const OFFLINE_QUEUE_KEY = 'qlinica_offline_queue';
const MAX_QUEUE_SIZE = 100;

class OfflineQueueService {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  /**
   * Initialize the queue from persistent storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        logger.debug(`Loaded ${this.queue.length} queued requests`, 'OfflineQueue');
      }
    } catch (error) {
      logger.error('Error loading offline queue', error);
      this.queue = [];
    }
  }

  /**
   * Add a request to the queue
   */
  async addToQueue(
    method: QueuedRequest['method'],
    endpoint: string,
    data?: any,
    priority: 'high' | 'normal' | 'low' = 'normal',
    maxRetries = 3
  ): Promise<QueuedRequest> {
    const request: QueuedRequest = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      endpoint,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: 0,
      maxRetries,
    };

    // Prevent queue from growing too large
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      const removed = this.queue.shift();
      logger.warn(
        `Queue full, removing oldest request: ${removed?.id}`,
        'OfflineQueue'
      );
    }

    this.queue.push(request);
    await this.persist();

    logger.debug(
      `Added request to queue: ${method} ${endpoint}`,
      'OfflineQueue'
    );

    return request;
  }

  /**
   * Remove a request from the queue
   */
  async removeFromQueue(id: string): Promise<void> {
    this.queue = this.queue.filter((req) => req.id !== id);
    await this.persist();
  }

  /**
   * Get the current queue
   */
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the entire queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    logger.debug('Offline queue cleared', 'OfflineQueue');
  }

  /**
   * Process queued requests (call when connection restored)
   */
  async processQueue(
    apiHandler: (request: QueuedRequest) => Promise<boolean>
  ): Promise<{
    successful: number;
    failed: number;
    remaining: number;
  }> {
    if (this.isProcessing) {
      logger.debug('Queue already processing, skipping...', 'OfflineQueue');
      return {
        successful: 0,
        failed: 0,
        remaining: this.queue.length,
      };
    }

    this.isProcessing = true;
    let successful = 0;
    let failed = 0;

    try {
      // Sort by priority (high first) and timestamp (oldest first)
      const sorted = [...this.queue].sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });

      // Process each request
      for (const request of sorted) {
        try {
          const success = await apiHandler(request);

          if (success) {
            await this.removeFromQueue(request.id);
            successful++;
            logger.debug(
              `Processed queued request: ${request.method} ${request.endpoint}`,
              'OfflineQueue'
            );
          } else {
            // Increment retry count
            request.retryCount++;

            // Keep in queue if retries remaining
            if (request.retryCount < request.maxRetries) {
              await this.persist();
              logger.warn(
                `Request failed, will retry: ${request.method} ${request.endpoint} (${request.retryCount}/${request.maxRetries})`,
                'OfflineQueue'
              );
            } else {
              // Remove after max retries exceeded
              await this.removeFromQueue(request.id);
              failed++;
              logger.error(
                `Request failed after max retries: ${request.method} ${request.endpoint}`,
                new Error('Max retries exceeded'),
                'OfflineQueue'
              );
            }
          }
        } catch (error) {
          logger.error(
            `Error processing queued request: ${request.method} ${request.endpoint}`,
            error as Error,
            'OfflineQueue'
          );

          // Try next request
          continue;
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return {
      successful,
      failed,
      remaining: this.queue.length,
    };
  }

  /**
   * Get statistics about the queue
   */
  getStats(): {
    total: number;
    byMethod: Record<string, number>;
    byPriority: Record<string, number>;
    oldestTimestamp: number | null;
  } {
    const stats = {
      total: this.queue.length,
      byMethod: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      oldestTimestamp: this.queue.length > 0 ? this.queue[0].timestamp : null,
    };

    for (const request of this.queue) {
      stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
      stats.byPriority[request.priority] =
        (stats.byPriority[request.priority] || 0) + 1;
    }

    return stats;
  }

  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error(
        'Error persisting offline queue',
        error as Error,
        'OfflineQueue'
      );
    }
  }
}

// Export singleton instance
export const offlineQueueService = new OfflineQueueService();
