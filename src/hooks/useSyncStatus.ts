import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService, type SyncStatus } from '../services/offlineSyncService';
import { analyticsService } from '../services/analyticsService';

interface UseSyncStatusReturn {
  status: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  queueCount: number;
  lastSyncTime: number | undefined;
  canSync: boolean;
  syncNow: () => Promise<void>;
  notifyOnline: () => Promise<void>;
  notifyOffline: () => Promise<void>;
}

export const useSyncStatus = (): UseSyncStatusReturn => {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    queueCount: 0,
  });

  useEffect(() => {
    // Subscribe to sync status updates
    const unsubscribe = offlineSyncService.subscribeToSyncStatusChanges((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    try {
      analyticsService.trackEvent('sync_manually_triggered', {
        queueCount: status.queueCount,
      });
      await offlineSyncService.sync();
    } catch (error) {
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'manual_sync',
      });
    }
  }, [status.queueCount]);

  const notifyOnline = useCallback(async () => {
    try {
      await offlineSyncService.notifyConnectionRestored();
      analyticsService.trackEvent('network_status_changed', {
        isOnline: true,
      });
    } catch (error) {
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'notify_online',
      });
    }
  }, []);

  const notifyOffline = useCallback(async () => {
    try {
      offlineSyncService.notifyConnectionLost();
      analyticsService.trackEvent('network_status_changed', {
        isOnline: false,
      });
    } catch (error) {
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'notify_offline',
      });
    }
  }, []);

  return {
    status,
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    queueCount: status.queueCount,
    lastSyncTime: status.lastSyncTime,
    canSync: status.queueCount > 0 && !status.isSyncing && status.isOnline,
    syncNow,
    notifyOnline,
    notifyOffline,
  };
};
