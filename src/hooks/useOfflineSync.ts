/**
 * useOfflineSync Hook
 * Provides access to offline sync capabilities
 */

import { useEffect, useState, useCallback } from 'react';
import { offlineSync, SyncState, QueuedOperation } from '../utils/offlineSync';

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime: number | null;
  queuedOperations: QueuedOperation[];
  queue: () => Promise<QueuedOperation>;
  sync: () => Promise<boolean>;
  clearQueue: () => Promise<void>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [syncState, setSyncState] = useState<SyncState>(offlineSync.getSyncState());
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>(
    offlineSync.getQueue(),
  );

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((newState) => {
      setSyncState(newState);
      setQueuedOperations(offlineSync.getQueue());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Queue operation with error handling
  const queue = useCallback(
    async (
      type: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      endpoint: string,
      data?: any,
    ): Promise<QueuedOperation> => {
      try {
        return await offlineSync.queueOperation(type, endpoint, data);
      } catch (error) {
        console.error('Error queueing operation:', error);
        throw error;
      }
    },
    [],
  );

  // Manually trigger sync
  const sync = useCallback(async (): Promise<boolean> => {
    try {
      return await offlineSync.syncQueue();
    } catch (error) {
      console.error('Error syncing queue:', error);
      return false;
    }
  }, []);

  // Clear queue
  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      await offlineSync.clearQueue();
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  }, []);

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    queueLength: syncState.queueLength,
    lastSyncTime: syncState.lastSyncTime,
    queuedOperations,
    queue,
    sync,
    clearQueue,
  };
};
