/**
 * Offline Sync Service
 * Manages offline booking operations and syncs when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookingService } from './bookingService';
import type { Booking } from './bookingService';
import { analyticsService } from './analyticsService';

export interface OfflineBookingQueue {
  id: string;
  operation: 'create' | 'reschedule' | 'cancel';
  bookingId?: string;
  data: {
    serviceId?: string;
    therapistId?: string;
    date?: string;
    time?: string;
    notes?: string;
  };
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = '@qlinica_offline_queue';
const MAX_RETRIES = 3;

class OfflineSyncService {
  private queue: OfflineBookingQueue[] = [];
  private isProcessing = false;
  private listeners: Set<(queue: OfflineBookingQueue[]) => void> = new Set();

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadQueue();
      await this.syncIfConnected();
    } catch (error) {
      console.error('Error initializing offline sync:', error);
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'offline_sync_init',
      });
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📋 Loaded ${this.queue.length} offline operations from storage`);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Add booking operation to queue
   */
  async queueBookingOperation(
    operation: 'create' | 'reschedule' | 'cancel',
    data: OfflineBookingQueue['data'],
    bookingId?: string
  ): Promise<string> {
    const id = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const queueItem: OfflineBookingQueue = {
      id,
      operation,
      bookingId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queueItem);
    await this.saveQueue();

    // Notify listeners
    this.notifyListeners();

    console.log(`📝 Queued ${operation} operation: ${id}`);

    // Try to sync if connected
    await this.syncIfConnected();

    return id;
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    count: number;
    operations: OfflineBookingQueue[];
  } {
    return {
      count: this.queue.length,
      operations: [...this.queue],
    };
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (queue: OfflineBookingQueue[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener([...this.queue]);
    });
  }

  /**
   * Setup network status listener (offline sync disabled for now)
   */
  private setupNetworkListener(): void {
    // NetInfo removed - will sync manually when needed
    console.log('📡 Offline sync initialized');
  }

  /**
   * Check if connected and sync if needed
   */
  private async syncIfConnected(): Promise<void> {
    try {
      // Assume connected for now (no NetInfo)
      if (this.queue.length > 0) {
        await this.sync();
      }
    } catch (error) {
      console.error('Error checking connection for sync:', error);
    }
  }

  /**
   * Process all queued operations
   */
  async sync(): Promise<{ synced: number; failed: number }> {
    if (this.isProcessing || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isProcessing = true;
    let synced = 0;
    let failed = 0;

    try {
      const itemsToProcess = [...this.queue];

      for (const item of itemsToProcess) {
        try {
          await this.processOperation(item);
          this.queue = this.queue.filter((q) => q.id !== item.id);
          synced++;
          this.notifyListeners();
        } catch (error) {
          item.retryCount++;

          if (item.retryCount >= MAX_RETRIES) {
            // Remove item after max retries
            this.queue = this.queue.filter((q) => q.id !== item.id);
            console.error(`❌ Operation failed after ${MAX_RETRIES} retries:`, item.id);
            analyticsService.trackError(
              error instanceof Error ? error : new Error(String(error)),
              {
                operation: 'offline_sync',
                bookingOperation: item.operation,
                retries: item.retryCount,
              }
            );
            failed++;
          } else {
            console.warn(`⚠️ Operation failed (retry ${item.retryCount}/${MAX_RETRIES}):`, item.id);
          }

          this.notifyListeners();
        }
      }

      await this.saveQueue();

      if (synced > 0 || failed > 0) {
        console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`);
      }

      analyticsService.trackEvent('offline_sync_complete', {
        synced,
        failed,
        queued: this.queue.length,
      });
    } catch (error) {
      console.error('Error during sync:', error);
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'offline_sync_process',
      });
    } finally {
      this.isProcessing = false;
    }

    return { synced, failed };
  }

  /**
   * Process a single operation
   */
  private async processOperation(item: OfflineBookingQueue): Promise<void> {
    switch (item.operation) {
      case 'create':
        if (!item.data.serviceId || !item.data.therapistId || !item.data.date || !item.data.time) {
          throw new Error('Missing required fields for booking creation');
        }
        await bookingService.createBooking({
          serviceId: item.data.serviceId,
          therapistId: item.data.therapistId,
          date: item.data.date,
          time: item.data.time,
          notes: item.data.notes || '',
        });
        break;

      case 'reschedule':
        if (!item.bookingId || !item.data.date || !item.data.time) {
          throw new Error('Missing required fields for rescheduling');
        }
        await bookingService.rescheduleBooking(item.bookingId, item.data.date, item.data.time);
        break;

      case 'cancel':
        if (!item.bookingId) {
          throw new Error('Missing booking ID for cancellation');
        }
        await bookingService.cancelBooking(item.bookingId);
        break;

      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Clear all queued operations (for testing/reset)
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
    console.log('🧹 Offline queue cleared');
  }

  /**
   * Retry a specific operation
   */
  async retryOperation(operationId: string): Promise<void> {
    const item = this.queue.find((q) => q.id === operationId);
    if (!item) {
      throw new Error('Operation not found');
    }

    item.retryCount = 0;
    await this.saveQueue();
    await this.sync();
  }
}

export const offlineSyncService = new OfflineSyncService();
