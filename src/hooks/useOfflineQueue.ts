import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

interface QueuedOperation<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

interface UseOfflineQueueResult<T = any> {
  queue: QueuedOperation<T>[];
  isProcessing: boolean;
  queueSize: number;
  addToQueue: (type: string, data: T, maxAttempts?: number) => Promise<void>;
  processQueue: (processor: (op: QueuedOperation<T>) => Promise<void>) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueuedOperation: (id: string) => QueuedOperation<T> | undefined;
}

const QUEUE_STORAGE_KEY = 'qlinica_offline_queue';
const QUEUE_PREFIX = 'queue_op_';

/**
 * Hook for managing offline operations queue with persistence
 * Automatically saves operations to AsyncStorage for reliable retry logic
 * 
 * @param storageKey - Custom storage key (default: qlinica_offline_queue)
 * 
 * @example
 * const { queue, addToQueue, processQueue } = useOfflineQueue();
 * 
 * // Add operation to queue
 * await addToQueue('create_booking', { serviceId: '1', date: '2024-03-23' });
 * 
 * // Process queue when online
 * await processQueue(async (operation) => {
 *   await api.post('/bookings', operation.data);
 * });
 */
export const useOfflineQueue = <T = any>(storageKey: string = QUEUE_STORAGE_KEY): UseOfflineQueueResult<T> => {
  const [queue, setQueue] = useState<QueuedOperation<T>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Load queue from storage on mount
  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedQueue = JSON.parse(stored) as QueuedOperation<T>[];
        setQueue(parsedQueue);
        logger.debug(`Loaded ${parsedQueue.length} operations from offline queue`);
      }
    } catch (error) {
      logger.error('Error loading offline queue', error);
    }
  }, [storageKey]);

  const saveQueue = useCallback(
    async (newQueue: QueuedOperation<T>[]) => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(newQueue));
      } catch (error) {
        logger.error('Error saving offline queue', error);
      }
    },
    [storageKey]
  );

  const addToQueue = useCallback(
    async (type: string, data: T, maxAttempts: number = 3) => {
      const operation: QueuedOperation<T> = {
        id: `${QUEUE_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts,
      };

      setQueue((prev) => {
        const newQueue = [...prev, operation];
        saveQueue(newQueue);
        return newQueue;
      });

      logger.debug(`Added operation to offline queue: ${operation.id}`, { type, data });
    },
    [saveQueue]
  );

  const removeFromQueue = useCallback(
    async (id: string) => {
      setQueue((prev) => {
        const newQueue = prev.filter((op) => op.id !== id);
        saveQueue(newQueue);
        return newQueue;
      });

      logger.debug(`Removed operation from offline queue: ${id}`);
    },
    [saveQueue]
  );

  const clearQueue = useCallback(async () => {
    setQueue([]);
    await AsyncStorage.removeItem(storageKey);
    logger.debug('Cleared offline queue');
  }, [storageKey]);

  const processQueue = useCallback(
    async (processor: (op: QueuedOperation<T>) => Promise<void>) => {
      if (processingRef.current || queue.length === 0) {
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);

      try {
        for (const operation of queue) {
          try {
            logger.debug(`Processing offline operation: ${operation.id}`, { type: operation.type });
            await processor(operation);
            await removeFromQueue(operation.id);
            logger.debug(`Successfully processed offline operation: ${operation.id}`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            operation.attempts += 1;

            if (operation.attempts >= operation.maxAttempts) {
              logger.error(
                `Operation ${operation.id} failed after ${operation.maxAttempts} attempts`,
                error
              );
              operation.error = errorMsg;
              // Keep in queue with error flag for manual retry
            } else {
              logger.warn(
                `Operation ${operation.id} failed, will retry (${operation.attempts}/${operation.maxAttempts})`,
                error
              );
            }

            setQueue((prev) =>
              prev.map((op) => (op.id === operation.id ? operation : op))
            );
          }
        }

        // Save final queue state
        setQueue((prev) => {
          saveQueue(prev);
          return prev;
        });
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [queue, removeFromQueue, saveQueue]
  );

  const getQueuedOperation = useCallback(
    (id: string) => {
      return queue.find((op) => op.id === id);
    },
    [queue]
  );

  return {
    queue,
    isProcessing,
    queueSize: queue.length,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearQueue,
    getQueuedOperation,
  };
};
