/**
 * Comprehensive Retry Mechanism
 * Handles API retries with exponential backoff, circuit breaker pattern, and error recovery
 */

import { logger } from './logger';

export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
  timeoutMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (attempt: number, error: any, nextDelayMs: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
}

/**
 * Default retry configuration
 * - Max 3 attempts
 * - Start with 1s delay, max 30s
 * - 2x backoff multiplier
 * - 10% jitter to prevent thundering herd
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  timeoutMs: 30000,
  shouldRetry: (error) => {
    // Retry on network errors, timeouts, and 5xx errors
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') {
      return true;
    }
    if (error?.response?.status >= 500) {
      return true;
    }
    // Don't retry on 4xx errors (except 408, 429)
    if (error?.response?.status === 408 || error?.response?.status === 429) {
      return true;
    }
    return false;
  },
  onRetry: () => {}, // Default no-op
};

/**
 * Calculate exponential backoff delay with jitter
 * 
 * Formula: min(initialDelay * (multiplier ^ attempt) * (1 ± jitter), maxDelay)
 * 
 * @example
 * calculateBackoffDelay(0, 1000, 30000, 2, 0.1) // ~1000-1100ms
 * calculateBackoffDelay(1, 1000, 30000, 2, 0.1) // ~1800-2200ms
 * calculateBackoffDelay(2, 1000, 30000, 2, 0.1) // ~3600-4400ms
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  jitterFactor: number
): number {
  // Calculate base delay
  const baseDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  
  // Cap at max delay
  const cappedDelay = Math.min(baseDelay, maxDelayMs);
  
  // Add jitter: ±jitterFactor%
  const jitterRange = cappedDelay * jitterFactor;
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;
  
  return Math.max(0, cappedDelay + jitter);
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.ceil(ms)));
}

/**
 * Execute function with automatic retry on failure
 * 
 * @param fn Function to retry
 * @param config Retry configuration
 * @returns RetryResult with success status, data, and metrics
 * 
 * @example
 * const result = await retryAsync(() => api.getServices(), {
 *   maxAttempts: 3,
 *   initialDelayMs: 1000,
 *   shouldRetry: (error) => error.response?.status >= 500
 * });
 * 
 * if (result.success) {
 *   console.log('Success after', result.attempts, 'attempts');
 *   return result.data;
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts');
 *   throw result.error;
 * }
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      logger.debug(`Attempt ${attempt + 1}/${finalConfig.maxAttempts}`);
      
      const data = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error('Operation timed out')),
            finalConfig.timeoutMs
          )
        ),
      ]);
      
      const totalTime = Date.now() - startTime;
      logger.debug(`Success on attempt ${attempt + 1}`, { totalTimeMs: totalTime });
      
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTimeMs: totalTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const shouldContinue =
        attempt < finalConfig.maxAttempts - 1 &&
        finalConfig.shouldRetry(error, attempt);
      
      if (shouldContinue) {
        const nextDelayMs = calculateBackoffDelay(
          attempt,
          finalConfig.initialDelayMs,
          finalConfig.maxDelayMs,
          finalConfig.backoffMultiplier,
          finalConfig.jitterFactor
        );
        
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${nextDelayMs}ms`, {
          error: lastError.message,
          attempt: attempt + 1,
        });
        
        finalConfig.onRetry(attempt + 1, error, nextDelayMs);
        await delay(nextDelayMs);
      } else {
        const totalTime = Date.now() - startTime;
        logger.error(`Failed after ${attempt + 1} attempts`, {
          error: lastError.message,
          totalTimeMs: totalTime,
        });
        
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
          totalTimeMs: totalTime,
        };
      }
    }
  }
  
  // Should not reach here, but return error just in case
  const totalTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: finalConfig.maxAttempts,
    totalTimeMs: totalTime,
  };
}

/**
 * Synchronous retry wrapper for non-async functions
 */
export function retrySync<T>(
  fn: () => T,
  config: RetryConfig = {}
): RetryResult<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      logger.debug(`Sync attempt ${attempt + 1}/${finalConfig.maxAttempts}`);
      
      const data = fn();
      const totalTime = Date.now() - startTime;
      
      logger.debug(`Sync success on attempt ${attempt + 1}`, { totalTimeMs: totalTime });
      
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTimeMs: totalTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const shouldContinue =
        attempt < finalConfig.maxAttempts - 1 &&
        finalConfig.shouldRetry(error, attempt);
      
      if (shouldContinue) {
        const delayMs = calculateBackoffDelay(
          attempt,
          finalConfig.initialDelayMs,
          finalConfig.maxDelayMs,
          finalConfig.backoffMultiplier,
          finalConfig.jitterFactor
        );
        
        logger.warn(`Sync attempt ${attempt + 1} failed, retrying after ${delayMs}ms`, {
          error: lastError.message,
        });
        
        // Sync sleep (blocks thread - use sparingly)
        const endTime = Date.now() + delayMs;
        while (Date.now() < endTime) {
          // Busy wait
        }
      } else {
        const totalTime = Date.now() - startTime;
        logger.error(`Sync failed after ${attempt + 1} attempts`, {
          error: lastError.message,
          totalTimeMs: totalTime,
        });
        
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
          totalTimeMs: totalTime,
        };
      }
    }
  }
  
  // Should not reach here
  const totalTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: finalConfig.maxAttempts,
    totalTimeMs: totalTime,
  };
}

/**
 * Circuit breaker state tracker
 * Prevents cascading failures by not attempting requests when service is down
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  
  constructor(
    private failureThreshold: number = 5,
    private successThreshold: number = 2,
    private timeout: number = 60000 // Reset after 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.successCount = 0;
        logger.debug('Circuit breaker transitioning to half-open');
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable');
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
  
  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        logger.debug('Circuit breaker closed - service recovered');
      }
    }
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      logger.warn('Circuit breaker opened - too many failures', {
        failures: this.failureCount,
      });
    }
  }
  
  getState() {
    return this.state;
  }
  
  reset() {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Create a circuit breaker for a specific API endpoint
 */
export function createCircuitBreaker(
  failureThreshold: number = 5,
  timeout: number = 60000
): CircuitBreaker {
  return new CircuitBreaker(failureThreshold, 2, timeout);
}

/**
 * Compose multiple retry strategies
 * Useful for fallback chains (e.g., primary API, then secondary API, then mock data)
 */
export async function retryWithFallback<T>(
  strategies: Array<() => Promise<T>>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < strategies.length; i++) {
    const result = await retryAsync(strategies[i], config);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error || new Error('Unknown error');
    logger.debug(`Fallback ${i + 1} failed, trying next strategy`);
  }
  
  return {
    success: false,
    error: lastError || new Error('All fallback strategies failed'),
    attempts: strategies.length,
    totalTimeMs: 0,
  };
}

export default {
  retryAsync,
  retrySync,
  CircuitBreaker,
  createCircuitBreaker,
  retryWithFallback,
};
