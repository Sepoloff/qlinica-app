/**
 * useOfflineSync
 * Hook for managing offline operations and sync status
 */

import { useEffect, useState, useCallback } from 'react';
import { offlineSyncService, OfflineBookingQueue } from '../services/offlineSyncService';

export interface UsOfflineSyncReturn {
  queue: OfflineBookingQueue[];
  queueCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  queueBooking: (
    operation: 'create' | 'reschedule' | 'cancel',
    data: any,
    bookingId?: string
  ) => Promise<string>;
  sync: () => Promise<{ synced: number; failed: number }>;
  clearQueue: () => Promise<void>;
  retryOperation: (operationId: string) => Promise<void>;
}

export const useOfflineSync = (): UsOfflineSyncReturn => {
  const [queue, setQueue] = useState<OfflineBookingQueue[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to queue changes
  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribeToQueueChanges((newQueue: OfflineBookingQueue[]) => {
      setQueue(newQueue);
    });

    return unsubscribe;
  }, []);

  const queueBooking = useCallback(
    async (
      operation: 'create' | 'reschedule' | 'cancel',
      data: any,
      bookingId?: string
    ): Promise<string> => {
      return offlineSyncService.queueBookingOperation(operation, data, bookingId);
    },
    []
  );

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await offlineSyncService.sync();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearQueue = useCallback(async () => {
    await offlineSyncService.clearQueue();
  }, []);

  const retryOperation = useCallback(async (operationId: string) => {
    await offlineSyncService.retryOperation(operationId);
  }, []);

  return {
    queue,
    queueCount: queue.length,
    isOnline,
    isSyncing,
    queueBooking,
    sync,
    clearQueue,
    retryOperation,
  };
};
