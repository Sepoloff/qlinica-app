/**
 * Safe Async Operations Utility
 * Prevents memory leaks from uncancelled async operations
 */

interface AsyncOperationOptions {
  timeout?: number;
  onTimeout?: () => void;
  signal?: AbortSignal;
}

/**
 * Execute async operation with automatic timeout and cancellation
 * @param fn - Async function to execute
 * @param options - Configuration options
 * @returns Promise that rejects on timeout or abort
 */
export async function executeWithTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T> {
  const {
    timeout = 30000, // 30 second default
    onTimeout,
    signal: externalSignal,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    onTimeout?.();
  }, timeout);

  try {
    // Create a combined signal that respects both internal and external abort
    const combinedSignal = createCombinedSignal(controller.signal, externalSignal);
    const result = await fn(combinedSignal);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Combine multiple abort signals into one
 */
function createCombinedSignal(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  
  signals.forEach(signal => {
    if (signal?.aborted) {
      controller.abort();
      return;
    }
    
    signal?.addEventListener('abort', () => controller.abort(), { once: true });
  });

  return controller.signal;
}

/**
 * Safe promise race with timeout
 * Returns the first settled promise or timeout error
 */
export function raceWithTimeout<T>(
  promises: Promise<T>[],
  timeoutMs: number = 30000
): Promise<T[]> {
  return Promise.race([
    Promise.all(promises),
    new Promise<T[]>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Debounce async function (prevents rapid duplicate calls)
 */
export function debounceAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delayMs: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;

  return async function (...args: T): Promise<R> {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          lastCall = Date.now();
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, Math.max(0, delayMs - timeSinceLastCall));
    });
  };
}

/**
 * Throttle async function (limits call frequency)
 */
export function throttleAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  intervalMs: number = 300
) {
  let lastCall = 0;
  let pending = false;

  return async function (...args: T): Promise<R> {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= intervalMs) {
      lastCall = now;
      pending = true;
      try {
        return await fn(...args);
      } finally {
        pending = false;
      }
    }

    if (!pending) {
      throw new Error(`Function call throttled. Wait ${intervalMs - timeSinceLastCall}ms`);
    }

    // Return a promise that resolves after the throttle interval
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, intervalMs - timeSinceLastCall);
    });
  };
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    maxDelayMs = 8000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Increase delay for next attempt
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Safe cache with automatic expiration
 */
export class SafeAsyncCache<K, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  getOrFetch(key: K, fetcher: () => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached) return Promise.resolve(cached);

    return fetcher().then(value => {
      this.set(key, value);
      return value;
    });
  }
}

/**
 * Create a cancellable promise wrapper
 */
export function createCancellablePromise<T>(
  fn: (onCancel: (callback: () => void) => void) => Promise<T>
): { promise: Promise<T>; cancel: () => void } {
  let cancelled = false;
  const callbacks: Array<() => void> = [];

  const promise = fn((callback) => {
    callbacks.push(callback);
  }).then(
    result => {
      if (cancelled) {
        callbacks.forEach(cb => cb());
        throw new Error('Promise was cancelled');
      }
      return result;
    },
    error => {
      if (cancelled) {
        callbacks.forEach(cb => cb());
        throw new Error('Promise was cancelled');
      }
      throw error;
    }
  );

  return {
    promise,
    cancel: () => {
      cancelled = true;
    },
  };
}
