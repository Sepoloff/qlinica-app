/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by failing fast when a service is down
 */

import { logger } from './logger';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes before closing (in half-open state)
  timeout: number; // Time (ms) before transitioning from open to half-open
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number = 0;
  private name: string;
  private config: CircuitBreakerConfig;

  constructor(
    name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.name = name;
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
    };
  }

  /**
   * Execute function through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        logger.info(`🔄 Circuit breaker ${this.name} entering HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN. Service unavailable.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = 'CLOSED';
        logger.info(`✅ Circuit breaker ${this.name} is CLOSED`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    logger.warn(`⚠️  Circuit breaker ${this.name} failure #${this.failureCount}`, {
      threshold: this.config.failureThreshold,
    });

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      logger.error(`🔴 Circuit breaker ${this.name} is OPEN`);
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    logger.info(`🔄 Circuit breaker ${this.name} reset`);
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Global circuit breakers for different services
 */
export const circuitBreakers = {
  api: new CircuitBreaker('API', { failureThreshold: 5, timeout: 30000 }),
  auth: new CircuitBreaker('Auth', { failureThreshold: 3, timeout: 60000 }),
  booking: new CircuitBreaker('Booking', { failureThreshold: 5, timeout: 30000 }),
};
