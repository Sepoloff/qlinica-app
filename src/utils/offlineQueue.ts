/**
 * Offline Request Queue - Queue failed requests and sync when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig } from 'axios';

export interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = '@qlinica_offline_queue';
const MAX_RETRIES = 3;

export class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
    }
  }

  async addRequest(config: AxiosRequestConfig) {
    const request: QueuedRequest = {
      id: `${Date.now()}_${Math.random()}`,
      config,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(request);
    await this.save();

    return request.id;
  }

  async removeRequest(id: string) {
    this.queue = this.queue.filter((req) => req.id !== id);
    await this.save();
  }

  async processQueue(axiosInstance: any) {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const failedRequests: QueuedRequest[] = [];

      for (const request of this.queue) {
        try {
          await axiosInstance.request(request.config);
          await this.removeRequest(request.id);
        } catch (error) {
          request.retryCount++;

          if (request.retryCount < MAX_RETRIES) {
            failedRequests.push(request);
          }
        }
      }

      this.queue = failedRequests;
      await this.save();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async clear() {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  private async save() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }
}

export const offlineQueue = new OfflineQueue();
