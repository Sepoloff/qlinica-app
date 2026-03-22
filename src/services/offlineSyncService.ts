/**
 * Offline Sync Service
 * Gerencia operações offline de reservas e sincroniza quando a conexão é restaurada
 * Suporta: auto-sync, retry automático, listeners de UI
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookingService } from './bookingService';
import type { Booking } from './bookingService';
import { analyticsService } from './analyticsService';

export interface OfflineBookingQueue {
  id: string;
  operation: 'create' | 'update' | 'cancel';
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
  lastError?: string;
  nextRetryTime?: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueCount: number;
  lastSyncTime?: number;
  nextRetryTime?: number;
}

const STORAGE_KEY = '@qlinica_offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 segundos entre retries
const EXPONENTIAL_BACKOFF = true; // Aumenta delay a cada retry

class OfflineSyncService {
  private queue: OfflineBookingQueue[] = [];
  private isProcessing = false;
  private isOnline = true;
  private lastSyncTime: number | null = null;
  private syncStatusListeners: Set<(status: SyncStatus) => void> = new Set();
  private queueListeners: Set<(queue: OfflineBookingQueue[]) => void> = new Set();
  private syncIntervalId: NodeJS.Timeout | null = null;

  /**
   * Inicializa o serviço de sync
   * Carrega fila, verifica conexão e inicia polling automático
   */
  async initialize(): Promise<void> {
    try {
      await this.loadQueue();
      
      // Simular checker de conectividade periodicamente (sem NetInfo)
      // Em produção, usar @react-native-community/netinfo
      this.setupAutoSync();
      
      // Tentar sync imediatamente
      await this.syncIfConnected();
      
      console.log('🔄 Offline sync service inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar offline sync:', error);
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'offline_sync_init',
      });
    }
  }

  /**
   * Configura auto-sync periódico (a cada 30s)
   * Em produção, deveria usar NetInfo para detectar mudanças de rede
   */
  private setupAutoSync(): void {
    // Limpar interval anterior se existir
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    // Polling periódico para tentar sincronizar
    this.syncIntervalId = setInterval(async () => {
      if (this.queue.length > 0 && !this.isProcessing) {
        await this.syncIfConnected();
      }
    }, 30000); // A cada 30 segundos

    console.log('⏰ Auto-sync configurado (polling a cada 30s)');
  }

  /**
   * Simula simulação de disponibilidade online
   * Pode ser chamado manualmente ou por um listener de rede
   */
  async notifyConnectionRestored(): Promise<void> {
    this.isOnline = true;
    console.log('📶 Conexão restaurada - tentando sincronizar fila offline');
    await this.syncIfConnected();
  }

  /**
   * Notifica que a conexão foi perdida
   */
  notifyConnectionLost(): void {
    this.isOnline = false;
    console.log('📴 Conexão perdida - operações ficarão offline');
    this.notifySyncStatusChange();
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
   * Adicionar operação de reserva à fila offline
   * Retorna ID da operação para tracking
   */
  async queueBookingOperation(
    operation: 'create' | 'update' | 'cancel',
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
      nextRetryTime: undefined,
      lastError: undefined,
    };

    this.queue.push(queueItem);
    await this.saveQueue();

    // Notificar listeners
    this.notifyListeners();
    this.notifySyncStatusChange();

    const operationLabel = {
      create: '📝 Criando reserva',
      update: '🔄 Atualizando reserva',
      cancel: '❌ Cancelando reserva',
    }[operation];

    console.log(
      `${operationLabel} (offline) - ID: ${id}\nData: ${JSON.stringify(data)}`
    );

    // Tentar sincronizar se estiver conectado
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
   * Obter status atual de sincronização (para UI)
   */
  getSyncStatus(): SyncStatus {
    const nextRetryItem = this.queue
      .filter(item => item.nextRetryTime)
      .sort((a, b) => (a.nextRetryTime ?? 0) - (b.nextRetryTime ?? 0))[0];

    return {
      isOnline: this.isOnline,
      isSyncing: this.isProcessing,
      queueCount: this.queue.length,
      lastSyncTime: this.lastSyncTime ?? undefined,
      nextRetryTime: nextRetryItem?.nextRetryTime,
    };
  }

  /**
   * Inscrever para mudanças na fila offline
   */
  subscribeToQueueChanges(listener: (queue: OfflineBookingQueue[]) => void): () => void {
    this.queueListeners.add(listener);
    // Enviar estado atual
    listener([...this.queue]);
    return () => this.queueListeners.delete(listener);
  }

  /**
   * Inscrever para mudanças no status de sincronização
   */
  subscribeToSyncStatusChanges(listener: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.add(listener);
    // Enviar estado atual
    listener(this.getSyncStatus());
    return () => this.syncStatusListeners.delete(listener);
  }

  /**
   * Notificar todos os listeners da fila
   */
  private notifyListeners(): void {
    this.queueListeners.forEach((listener) => {
      listener([...this.queue]);
    });
  }

  /**
   * Notificar todos os listeners do status
   */
  private notifySyncStatusChange(): void {
    this.syncStatusListeners.forEach((listener) => {
      listener(this.getSyncStatus());
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
   * Processar todas as operações enfileiradas
   * Com retry automático, backoff exponencial e feedback para UI
   */
  async sync(): Promise<{ synced: number; failed: number }> {
    if (this.isProcessing || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isProcessing = true;
    this.notifySyncStatusChange();

    let synced = 0;
    let failed = 0;

    try {
      const itemsToProcess = [...this.queue];
      console.log(`🔄 Iniciando sincronização de ${itemsToProcess.length} operações offline`);

      for (const item of itemsToProcess) {
        // Verificar se é hora de retry (baseado em nextRetryTime)
        if (item.nextRetryTime && item.nextRetryTime > Date.now()) {
          console.log(`⏳ Operação ${item.id} aguardando retry até ${new Date(item.nextRetryTime)}`);
          continue;
        }

        try {
          await this.processOperation(item);
          this.queue = this.queue.filter((q) => q.id !== item.id);
          synced++;
          console.log(`✅ Operação sincronizada: ${item.id} (${item.operation})`);
          this.notifyListeners();
        } catch (error) {
          item.retryCount++;
          item.lastError = error instanceof Error ? error.message : String(error);

          if (item.retryCount >= MAX_RETRIES) {
            // Remover após max retries
            this.queue = this.queue.filter((q) => q.id !== item.id);
            console.error(`❌ Operação falhou após ${MAX_RETRIES} tentativas: ${item.id}`, item.lastError);
            
            analyticsService.trackError(
              error instanceof Error ? error : new Error(String(error)),
              {
                operation: 'offline_sync',
                bookingOperation: item.operation,
                retries: item.retryCount,
                error: item.lastError,
              }
            );
            failed++;
          } else {
            // Calcular próximo tempo de retry com backoff exponencial
            const baseDelay = RETRY_DELAY_MS;
            const exponentialDelay = EXPONENTIAL_BACKOFF 
              ? Math.pow(2, item.retryCount - 1) * baseDelay 
              : baseDelay;
            
            item.nextRetryTime = Date.now() + exponentialDelay;

            console.warn(
              `⚠️ Operação falhou (tentativa ${item.retryCount}/${MAX_RETRIES}): ${item.id}`,
              `Próxima tentativa em ${(exponentialDelay / 1000).toFixed(1)}s`
            );
          }

          this.notifyListeners();
        }
      }

      await this.saveQueue();

      this.lastSyncTime = Date.now();

      if (synced > 0 || failed > 0) {
        console.log(`✅ Sincronização completa: ${synced} sincronizadas, ${failed} falhadas, ${this.queue.length} pendentes`);
      }

      analyticsService.trackEvent('offline_sync_complete', {
        synced,
        failed,
        queued: this.queue.length,
        totalRetries: itemsToProcess.reduce((sum, item) => sum + item.retryCount, 0),
      });
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'offline_sync_process',
      });
    } finally {
      this.isProcessing = false;
      this.notifySyncStatusChange();
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

      case 'update':
        if (!item.bookingId) {
          throw new Error('Missing booking ID for update');
        }
        await bookingService.updateBooking(item.bookingId, {
          date: item.data.date,
          time: item.data.time,
          notes: item.data.notes,
        });
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
   * Limpar todas as operações enfileiradas (para teste/reset)
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
    this.notifySyncStatusChange();
    console.log('🧹 Fila offline limpa');
  }

  /**
   * Destruir o serviço (limpar timers, etc)
   */
  destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    this.queueListeners.clear();
    this.syncStatusListeners.clear();
    console.log('🛑 Serviço de sync offline destruído');
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
