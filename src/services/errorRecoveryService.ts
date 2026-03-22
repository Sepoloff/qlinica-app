/**
 * Error Recovery Service
 * Handles error recovery strategies and resilience patterns
 */

import { analyticsService } from './analyticsService';

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  shouldRetry: (error: Error, attempt: number) => boolean;
}

export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'alert' | 'navigate';
  payload?: any;
}

export interface ErrorContext {
  screen?: string;
  action?: string;
  userId?: string;
  data?: Record<string, any>;
}

const DEFAULT_STRATEGY: ErrorRecoveryStrategy = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx errors
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('500') ||
      message.includes('503')
    );
  },
};

class ErrorRecoveryService {
  private errorHistory: Array<{
    error: Error;
    timestamp: number;
    context: ErrorContext;
  }> = [];

  private recoveryStrategies = new Map<string, ErrorRecoveryStrategy>();
  private fallbackHandlers = new Map<string, (error: Error) => RecoveryAction>();

  /**
   * Register error type with custom recovery strategy
   */
  registerStrategy(
    errorType: string,
    strategy: Partial<ErrorRecoveryStrategy>
  ): void {
    const merged = {
      ...DEFAULT_STRATEGY,
      ...strategy,
    };
    this.recoveryStrategies.set(errorType, merged);
  }

  /**
   * Register fallback handler for error type
   */
  registerFallbackHandler(
    errorType: string,
    handler: (error: Error) => RecoveryAction
  ): void {
    this.fallbackHandlers.set(errorType, handler);
  }

  /**
   * Execute with automatic retry
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    errorType: string = 'default',
    context?: ErrorContext
  ): Promise<T> {
    const strategy = this.recoveryStrategies.get(errorType) || DEFAULT_STRATEGY;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < strategy.maxRetries; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!strategy.shouldRetry(lastError, attempt)) {
          this.recordError(lastError, context);
          throw lastError;
        }

        if (attempt < strategy.maxRetries - 1) {
          const delayMs = strategy.delayMs * Math.pow(strategy.backoffMultiplier, attempt);
          console.log(`🔄 Retrying after ${delayMs}ms (attempt ${attempt + 1}/${strategy.maxRetries})`);
          await this.delay(delayMs);
        }
      }
    }

    if (lastError) {
      this.recordError(lastError, context);
      throw lastError;
    }

    throw new Error('Unknown error during retry');
  }

  /**
   * Handle error with recovery
   */
  async handleError(
    error: Error,
    errorType: string = 'default',
    context?: ErrorContext
  ): Promise<RecoveryAction> {
    this.recordError(error, context);

    // Get fallback handler if registered
    const fallbackHandler = this.fallbackHandlers.get(errorType);
    if (fallbackHandler) {
      const action = fallbackHandler(error);

      analyticsService.trackEvent('error_recovery_action', {
        errorType,
        actionType: action.type,
        screen: context?.screen,
        action: context?.action,
      });

      return action;
    }

    // Default recovery action
    return {
      type: 'alert',
      payload: {
        title: 'Erro',
        message: this.getUserFriendlyMessage(error),
      },
    };
  }

  /**
   * Record error for analytics
   */
  private recordError(error: Error, context?: ErrorContext): void {
    this.errorHistory.push({
      error,
      timestamp: Date.now(),
      context: context || {},
    });

    // Keep only last 50 errors
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }

    analyticsService.trackError(error, context || {});
  }

  /**
   * Convert technical error to user-friendly message
   */
  getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network')) {
      return 'Problema de conexão. Verifique sua internet.';
    }
    if (message.includes('timeout')) {
      return 'A solicitação demorou muito. Tente novamente.';
    }
    if (message.includes('unauthorized')) {
      return 'Sessão expirada. Por favor, faça login novamente.';
    }
    if (message.includes('forbidden')) {
      return 'Você não tem permissão para fazer essa ação.';
    }
    if (message.includes('not found')) {
      return 'Recurso não encontrado.';
    }
    if (message.includes('invalid')) {
      return 'Dados inválidos. Verifique e tente novamente.';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'Erro no servidor. Tente novamente mais tarde.';
    }

    return 'Algo deu errado. Tente novamente.';
  }

  /**
   * Get error report for debugging
   */
  getErrorReport(): {
    totalErrors: number;
    lastError?: Error;
    errorTypes: string[];
    history: typeof this.errorHistory;
  } {
    return {
      totalErrors: this.errorHistory.length,
      lastError: this.errorHistory[this.errorHistory.length - 1]?.error,
      errorTypes: [...new Set(this.errorHistory.map((e) => e.error.name))],
      history: this.errorHistory,
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Implement circuit breaker pattern
   */
  createCircuitBreaker(
    fn: () => Promise<any>,
    options?: {
      failureThreshold?: number;
      successThreshold?: number;
      timeout?: number;
    }
  ) {
    const failureThreshold = options?.failureThreshold || 5;
    const successThreshold = options?.successThreshold || 2;
    const timeout = options?.timeout || 60000;

    let failures = 0;
    let successes = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';
    let lastFailureTime: number = 0;

    return async () => {
      // Check if circuit should reset
      if (state === 'open' && Date.now() - lastFailureTime > timeout) {
        state = 'half-open';
        successes = 0;
      }

      if (state === 'open') {
        throw new Error('Circuit breaker is open');
      }

      try {
        const result = await fn();

        if (state === 'half-open') {
          successes++;
          if (successes >= successThreshold) {
            state = 'closed';
            failures = 0;
          }
        } else {
          failures = 0;
        }

        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();

        if (failures >= failureThreshold) {
          state = 'open';
          console.error('⚠️ Circuit breaker opened');
        }

        throw error;
      }
    };
  }

  /**
   * Exponential backoff helper
   */
  exponentialBackoff(attempt: number, initialDelayMs: number = 1000, maxDelayMs: number = 32000): number {
    const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
    const jitter = Math.random() * 0.1 * delay;
    return Math.round(delay + jitter);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create resilient request handler
   */
  createResilientHandler<T>(
    fn: () => Promise<T>,
    options?: {
      timeout?: number;
      retries?: number;
      fallback?: () => Promise<T>;
      onRetry?: (attempt: number, error: Error) => void;
    }
  ) {
    return async (): Promise<T> => {
      const retries = options?.retries || 3;
      const timeout = options?.timeout || 10000;
      const fallback = options?.fallback;

      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          return await Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Request timeout after ${timeout}ms`)),
                timeout
              )
            ),
          ]);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          if (options?.onRetry && attempt < retries - 1) {
            options.onRetry(attempt + 1, err);
          }

          if (attempt === retries - 1) {
            if (fallback) {
              try {
                return await fallback();
              } catch (fallbackError) {
                throw err; // Throw original error if fallback fails
              }
            }
            throw err;
          }

          const delay = this.exponentialBackoff(attempt);
          await this.delay(delay);
        }
      }

      throw new Error('Max retries exceeded');
    };
  }
}

export const errorRecoveryService = new ErrorRecoveryService();

/**
 * Initialize default error recovery strategies
 */
export function initializeErrorRecovery(): void {
  // Network errors - aggressive retry
  errorRecoveryService.registerStrategy('network', {
    maxRetries: 5,
    delayMs: 500,
    backoffMultiplier: 1.5,
    shouldRetry: (error) => {
      const message = error.message.toLowerCase();
      return message.includes('network') || message.includes('timeout');
    },
  });

  // API errors - moderate retry
  errorRecoveryService.registerStrategy('api', {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
      const message = error.message.toLowerCase();
      return message.includes('500') || message.includes('503');
    },
  });

  // Authentication errors - no retry
  errorRecoveryService.registerStrategy('auth', {
    maxRetries: 1,
    delayMs: 0,
    backoffMultiplier: 1,
    shouldRetry: () => false,
  });

  // Database errors - moderate retry
  errorRecoveryService.registerStrategy('database', {
    maxRetries: 2,
    delayMs: 2000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
      const message = error.message.toLowerCase();
      return !message.includes('not found');
    },
  });
}
