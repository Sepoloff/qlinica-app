/**
 * Offline Sync Manager
 * Handles queueing and syncing operations when offline
 * Ensures data persistence and eventual consistency
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiClient } from '../config/api';

export interface QueuedOperation {
  id: string;
  type: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime: number | null;
}

const QUEUE_STORAGE_KEY = '@qlinica_offline_queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 10000; // 10 seconds

class OfflineSyncManager {
  private queue: QueuedOperation[] = [];
  private syncState: SyncState = {
    isOnline: true,
    isSyncing: false,
    queueLength: 0,
    lastSyncTime: null,
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(state: SyncState) => void> = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize sync manager
   */
  async initialize() {
    try {
      // Load persisted queue
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }

      // Setup network listener
      const subscription = NetInfo.addEventListener((state) => {
        const isOnline = state.isConnected ?? true;
        this.syncState.isOnline = isOnline;
        this.notifyListeners();

        if (isOnline && this.queue.length > 0) {
          this.syncQueue();
        }
      });

      // Setup periodic sync
      this.syncInterval = setInterval(() => {
        if (this.syncState.isOnline && this.queue.length > 0 && !this.syncState.isSyncing) {
          this.syncQueue();
        }
      }, SYNC_INTERVAL);

      return subscription;
    } catch (error) {
      console.error('Error initializing offline sync:', error);
    }
  }

  /**
   * Queue an operation for later sync
   */
  async queueOperation(
    type: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<QueuedOperation> {
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
    };

    this.queue.push(operation);
    this.syncState.queueLength = this.queue.length;
    await this.persistQueue();
    this.notifyListeners();

    console.log(`[OfflineSync] Operation queued: ${operation.id} (${type} ${endpoint})`);
    return operation;
  }

  /**
   * Attempt to sync all queued operations
   */
  async syncQueue(): Promise<boolean> {
    if (this.syncState.isSyncing || this.queue.length === 0 || !this.syncState.isOnline) {
      return false;
    }

    this.syncState.isSyncing = true;
    this.notifyListeners();

    try {
      const results: { success: number; failed: number } = { success: 0, failed: 0 };

      // Process queue in order (FIFO)
      while (this.queue.length > 0) {
        const operation = this.queue[0];

        try {
          await this.processOperation(operation);
          this.queue.shift(); // Remove from queue
          results.success++;
          console.log(`[OfflineSync] Operation synced: ${operation.id}`);
        } catch (error) {
          operation.retries++;

          if (operation.retries >= operation.maxRetries) {
            this.queue.shift(); // Remove after max retries
            results.failed++;
            console.error(`[OfflineSync] Operation failed after retries: ${operation.id}`, error);
          } else {
            console.warn(`[OfflineSync] Operation retry ${operation.retries}/${operation.maxRetries}: ${operation.id}`);
            break; // Stop processing, retry later
          }
        }
      }

      this.syncState.lastSyncTime = Date.now();
      await this.persistQueue();
      console.log(`[OfflineSync] Sync complete. Success: ${results.success}, Failed: ${results.failed}`);
    } finally {
      this.syncState.isSyncing = false;
      this.notifyListeners();
    }

    return true;
  }

  /**
   * Process single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'POST':
        await apiClient.post(operation.endpoint, operation.data);
        break;
      case 'PUT':
        await apiClient.put(operation.endpoint, operation.data);
        break;
      case 'PATCH':
        await apiClient.patch(operation.endpoint, operation.data);
        break;
      case 'DELETE':
        await apiClient.delete(operation.endpoint);
        break;
    }
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.syncState.queueLength = this.queue.length;
    } catch (error) {
      console.error('Error persisting queue:', error);
    }
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get queue contents
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    this.syncState.queueLength = 0;
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    this.notifyListeners();
  }

  /**
   * Subscribe to sync state changes
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.getSyncState());
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const offlineSync = new OfflineSyncManager();
