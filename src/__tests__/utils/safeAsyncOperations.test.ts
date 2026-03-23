import {
  executeWithTimeout,
  debounceAsync,
  throttleAsync,
  retryAsync,
  SafeAsyncCache,
} from '../../utils/safeAsyncOperations';

describe('safeAsyncOperations', () => {
  describe('executeWithTimeout', () => {
    it('should execute function successfully within timeout', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const fn = (signal: AbortSignal) => mockFn();

      const result = await executeWithTimeout(fn, { timeout: 5000 });
      expect(result).toBe('success');
    }, 10000);
  });

  describe('debounceAsync', () => {
    it('should call function after delay', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');
      const debounced = debounceAsync(mockFn, 50);

      const promise = debounced('test');

      // Function should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce to complete
      const result = await promise;

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalled();
    }, 10000);
  });

  describe('throttleAsync', () => {
    it('should allow calls after throttle interval', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');
      const throttled = throttleAsync(mockFn, 50);

      // First call
      await throttled('a');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Subsequent call within throttle window should fail or queue
      try {
        await throttled('b');
      } catch {
        // Expected - throttled
      }

      // Wait for throttle interval
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second call should succeed
      const result = await throttled('c');
      expect(result).toBe('result');
    }, 10000);
  });

  describe('retryAsync', () => {
    it('should retry on failure', async () => {
      let attempts = 0;
      const mockFn = jest.fn(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve('success');
      });

      const result = await retryAsync(mockFn, {
        maxRetries: 3,
        initialDelayMs: 10,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Permanent failure'));

      await expect(
        retryAsync(mockFn, {
          maxRetries: 2,
          initialDelayMs: 10,
        })
      ).rejects.toThrow('Permanent failure');

      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect shouldRetry predicate', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('Not retryable'));

      await expect(
        retryAsync(mockFn, {
          maxRetries: 3,
          initialDelayMs: 10,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('Not retryable');

      expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('SafeAsyncCache', () => {
    it('should store and retrieve values', () => {
      const cache = new SafeAsyncCache<string, string>();
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for expired entries', async () => {
      const cache = new SafeAsyncCache<string, string>(100); // 100ms TTL
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should check if key exists', () => {
      const cache = new SafeAsyncCache<string, string>();
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete entries', () => {
      const cache = new SafeAsyncCache<string, string>();
      cache.set('key1', 'value1');

      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should clear all entries', () => {
      const cache = new SafeAsyncCache<string, string>();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should fetch and cache values', async () => {
      const cache = new SafeAsyncCache<string, string>();
      const fetcher = jest.fn().mockResolvedValue('fetched');

      const result1 = await cache.getOrFetch('key1', fetcher);
      const result2 = await cache.getOrFetch('key1', fetcher);

      expect(result1).toBe('fetched');
      expect(result2).toBe('fetched');
      expect(fetcher).toHaveBeenCalledTimes(1); // Only called once
    });
  });
});
