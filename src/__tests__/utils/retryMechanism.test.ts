/**
 * Tests for Retry Mechanism
 */

import {
  retryAsync,
  retrySync,
  createCircuitBreaker,
  retryWithFallback,
} from '../../utils/retryMechanism';

describe('retryMechanism', () => {
  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await retryAsync(fn);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');
      
      const result = await retryAsync(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        shouldRetry: () => true,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      const result = await retryAsync(fn, {
        maxAttempts: 2,
        initialDelayMs: 10,
        shouldRetry: () => true,
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Persistent error');
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry when shouldRetry returns false', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Bad request'))
        .mockResolvedValueOnce('success');
      
      const result = await retryAsync(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        shouldRetry: () => false,
      });
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should timeout after specified duration', async () => {
      const fn = jest.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve('slow'), 1000))
      );
      
      const result = await retryAsync(fn, {
        maxAttempts: 1,
        timeoutMs: 100,
        shouldRetry: () => false,
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timed out');
    });

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail once'))
        .mockResolvedValueOnce('success');
      
      const result = await retryAsync(fn, {
        maxAttempts: 2,
        initialDelayMs: 10,
        shouldRetry: () => true,
        onRetry,
      });
      
      expect(result.success).toBe(true);
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
    });

    it('should apply exponential backoff', async () => {
      const durations: number[] = [];
      const fn = jest
        .fn()
        .mockImplementation(() => {
          durations.push(Date.now());
          if (fn.mock.calls.length < 3) {
            return Promise.reject(new Error('Retry'));
          }
          return Promise.resolve('success');
        });
      
      const result = await retryAsync(fn, {
        maxAttempts: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
        shouldRetry: () => true,
      });
      
      expect(result.success).toBe(true);
      expect(durations.length).toBe(3);
      
      // Check that delays increased (with some tolerance for jitter)
      const delay1 = durations[1] - durations[0];
      const delay2 = durations[2] - durations[1];
      expect(delay2).toBeGreaterThanOrEqual(delay1 * 0.8); // Account for jitter
    });
  });

  describe('retrySync', () => {
    it('should succeed on first attempt', () => {
      const fn = jest.fn(() => 'success');
      
      const result = retrySync(fn);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should fail after max attempts', () => {
      const fn = jest.fn(() => {
        throw new Error('Persistent error');
      });
      
      const result = retrySync(fn, {
        maxAttempts: 2,
        shouldRetry: () => true,
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Persistent error');
      expect(result.attempts).toBe(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should start in closed state', () => {
      const breaker = createCircuitBreaker();
      expect(breaker.getState()).toBe('closed');
    });

    it('should open after failure threshold', async () => {
      const breaker = createCircuitBreaker(2, 1000);
      const fn = jest.fn(() => Promise.reject(new Error('Fail')));
      
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }
      
      expect(breaker.getState()).toBe('open');
      
      // Should not call fn when open
      try {
        await breaker.execute(fn);
      } catch (e) {
        expect((e as Error).message).toContain('Circuit breaker is open');
      }
      
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should transition to half-open after timeout', async () => {
      const breaker = createCircuitBreaker(1, 50); // 50ms timeout, 1 failure threshold
      const fn = jest.fn(() => Promise.reject(new Error('Fail')));
      
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
      
      expect(breaker.getState()).toBe('open');
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Try again - should transition to half-open and execute
      const successFn = jest.fn(() => Promise.resolve('success'));
      const result = await breaker.execute(successFn);
      
      expect(result).toBe('success');
      // After first successful attempt in half-open, state is still half-open (needs 2 successes)
      // We need a second success to close
      const result2 = await breaker.execute(successFn);
      expect(result2).toBe('success');
      expect(breaker.getState()).toBe('closed');
    }, 10000);

    it('should reset', () => {
      const breaker = createCircuitBreaker();
      breaker.reset();
      expect(breaker.getState()).toBe('closed');
    });
  });

  describe('retryWithFallback', () => {
    it('should try first strategy', async () => {
      const fn1 = jest.fn(() => Promise.resolve('success'));
      const fn2 = jest.fn(() => Promise.resolve('fallback'));
      
      const result = await retryWithFallback([fn1, fn2], {
        maxAttempts: 1,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).not.toHaveBeenCalled();
    });

    it('should fallback when first fails', async () => {
      const fn1 = jest
        .fn()
        .mockRejectedValue(new Error('Primary failed'));
      const fn2 = jest.fn(() => Promise.resolve('fallback'));
      
      const result = await retryWithFallback([fn1, fn2], {
        maxAttempts: 1,
        shouldRetry: () => false,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('fallback');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('should fail if all fallbacks fail', async () => {
      const fn1 = jest.fn(() => Promise.reject(new Error('Fail 1')));
      const fn2 = jest.fn(() => Promise.reject(new Error('Fail 2')));
      
      const result = await retryWithFallback([fn1, fn2], {
        maxAttempts: 1,
        shouldRetry: () => false,
      });
      
      expect(result.success).toBe(false);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });
});
