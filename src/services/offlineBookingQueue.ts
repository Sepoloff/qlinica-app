/**
 * Offline Booking Queue Service
 * Queues booking requests when offline and syncs when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';
import { checkNetworkConnection } from '../utils/networkStatus';
import { analyticsService } from './analyticsService';

export interface PendingBooking {
  id: string;
  serviceId: string;
  therapistId: string;
  date: string;
  time: string;
  notes?: string;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
  retries: number;
  lastError?: string;
}

const PENDING_BOOKINGS_KEY = 'pendingBookings';
const MAX_RETRIES = 5;

class OfflineBookingQueue {
  private queue: PendingBooking[] = [];
  private isSyncing = false;

  /**
   * Initialize the queue from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PENDING_BOOKINGS_KEY);
      this.queue = stored ? JSON.parse(stored) : [];
      
      console.log(`📦 Initialized booking queue with ${this.queue.length} pending items`);
      
      // Try to sync immediately if online
      if (await checkNetworkConnection()) {
        this.syncQueue().catch(err => {
          console.warn('Auto-sync on init failed:', err);
        });
      }
    } catch (error) {
      console.error('Failed to initialize booking queue:', error);
      this.queue = [];
    }
  }

  /**
   * Add a booking to the queue
   */
  async addBooking(booking: Omit<PendingBooking, 'id' | 'createdAt' | 'status' | 'retries' | 'lastError'>): Promise<PendingBooking> {
    const pendingBooking: PendingBooking = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random()}`,
      createdAt: Date.now(),
      status: 'pending',
      retries: 0,
    };

    this.queue.push(pendingBooking);
    await this.saveQueue();

    analyticsService.trackEvent('booking_queued_offline', {
      bookingId: pendingBooking.id,
      serviceId: booking.serviceId,
      therapistId: booking.therapistId,
    });

    console.log(`📌 Booking queued (offline): ${pendingBooking.id}`);

    return pendingBooking;
  }

  /**
   * Get all pending bookings
   */
  getPendingBookings(): PendingBooking[] {
    return this.queue;
  }

  /**
   * Get count of pending bookings
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Sync all pending bookings with server
   */
  async syncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      console.warn('Sync already in progress');
      return { synced: 0, failed: 0 };
    }

    // Check network connection first
    const isOnline = await checkNetworkConnection();
    if (!isOnline) {
      console.log('📡 Not online, skipping sync');
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    console.log(`🔄 Starting sync of ${this.queue.length} pending bookings`);

    // Create a copy to iterate over
    const pendingBookings = [...this.queue];

    for (const booking of pendingBookings) {
      // Skip if already syncing and hit max retries
      if (booking.status === 'syncing' && booking.retries >= MAX_RETRIES) {
        failed++;
        continue;
      }

      try {
        // Mark as syncing
        const bookingIndex = this.queue.findIndex(b => b.id === booking.id);
        if (bookingIndex >= 0) {
          this.queue[bookingIndex].status = 'syncing';
          this.queue[bookingIndex].retries++;
        }

        // Try to submit to server
        await api.post('/bookings', {
          serviceId: booking.serviceId,
          therapistId: booking.therapistId,
          date: booking.date,
          time: booking.time,
          notes: booking.notes || '',
        });

        // Remove from queue on success
        const successIndex = this.queue.findIndex(b => b.id === booking.id);
        if (successIndex >= 0) {
          this.queue.splice(successIndex, 1);
        }

        synced++;

        analyticsService.trackEvent('booking_synced', {
          bookingId: booking.id,
          serviceId: booking.serviceId,
        });

        console.log(`✅ Booking synced: ${booking.id}`);
      } catch (error: any) {
        const bookingIndex = this.queue.findIndex(b => b.id === booking.id);
        if (bookingIndex >= 0) {
          this.queue[bookingIndex].status = 'failed';
          this.queue[bookingIndex].lastError = error?.message || 'Unknown error';

          // Mark for removal if max retries exceeded
          if (this.queue[bookingIndex].retries >= MAX_RETRIES) {
            failed++;
            console.error(`❌ Booking failed after ${MAX_RETRIES} retries: ${booking.id}`);
            analyticsService.trackError(error, {
              type: 'booking_sync_failed',
              bookingId: booking.id,
              retries: this.queue[bookingIndex].retries,
            });
          }
        }
      }
    }

    await this.saveQueue();
    this.isSyncing = false;

    console.log(`✨ Sync complete: ${synced} synced, ${failed} failed`);

    return { synced, failed };
  }

  /**
   * Remove a booking from the queue
   */
  async removeBooking(bookingId: string): Promise<void> {
    const index = this.queue.findIndex(b => b.id === bookingId);
    if (index >= 0) {
      this.queue.splice(index, 1);
      await this.saveQueue();
    }
  }

  /**
   * Clear all pending bookings
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(PENDING_BOOKINGS_KEY);
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_BOOKINGS_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save booking queue:', error);
    }
  }
}

// Export singleton instance
export const offlineBookingQueue = new OfflineBookingQueue();
