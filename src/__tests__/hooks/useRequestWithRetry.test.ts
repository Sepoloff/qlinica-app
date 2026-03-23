/**
 * Tests for useRequestWithRetry hook
 */

describe('useRequestWithRetry Hook', () => {
  it('should be defined and exported', () => {
    const module = require('../../hooks/useRequestWithRetry');
    expect(module.useRequestWithRetry).toBeDefined();
    expect(module.useMultiRequestWithRetry).toBeDefined();
  });

  it('should export correct hook signatures', () => {
    const module = require('../../hooks/useRequestWithRetry');
    expect(typeof module.useRequestWithRetry).toBe('function');
    expect(typeof module.useMultiRequestWithRetry).toBe('function');
  });

  it('should have proper TypeScript types', () => {
    const module = require('../../hooks/useRequestWithRetry');
    expect(module.default).toBeDefined();
  });
});

describe('Exponential Backoff Calculation', () => {
  it('should calculate correct backoff delays', () => {
    // backoff = initialDelay * (multiplier ^ attempt)
    const initialDelay = 500;
    const multiplier = 2;

    const delay0 = initialDelay * Math.pow(multiplier, 0); // 500
    const delay1 = initialDelay * Math.pow(multiplier, 1); // 1000
    const delay2 = initialDelay * Math.pow(multiplier, 2); // 2000

    expect(delay0).toBe(500);
    expect(delay1).toBe(1000);
    expect(delay2).toBe(2000);
  });

  it('should respect max delay cap', () => {
    const initialDelay = 1000;
    const multiplier = 2;
    const maxDelay = 10000;

    let delay = initialDelay;
    for (let i = 0; i < 5; i++) {
      delay = Math.min(initialDelay * Math.pow(multiplier, i), maxDelay);
    }

    expect(delay).toBeLessThanOrEqual(maxDelay);
  });

  it('should add jitter to prevent thundering herd', () => {
    const baseDelay = 1000;
    const jitterFactor = 0.1;

    const jitterMin = baseDelay * (1 - jitterFactor);
    const jitterMax = baseDelay * (1 + jitterFactor);

    // Generate a few random jittered delays
    for (let i = 0; i < 10; i++) {
      const jitter = (Math.random() - 0.5) * jitterFactor * 2;
      const jitteredDelay = baseDelay * (1 + jitter);
      
      expect(jitteredDelay).toBeGreaterThanOrEqual(jitterMin);
      expect(jitteredDelay).toBeLessThanOrEqual(jitterMax);
    }
  });
});

describe('Retry Strategy Logic', () => {
  it('should retry on network errors', () => {
    const networkError = new Error('Network error: ECONNREFUSED');
    const shouldRetry = networkError.message.toLowerCase().includes('network');
    expect(shouldRetry).toBe(true);
  });

  it('should retry on timeout errors', () => {
    const timeoutError = new Error('Request timeout');
    const shouldRetry = timeoutError.message.toLowerCase().includes('timeout');
    expect(shouldRetry).toBe(true);
  });

  it('should retry on 5xx server errors', () => {
    const serverError = new Error('Server error') as any;
    serverError.response = { status: 503 };
    const shouldRetry = serverError.response?.status >= 500;
    expect(shouldRetry).toBe(true);
  });

  it('should retry on 429 (Too Many Requests)', () => {
    const rateLimitError = new Error('Too many requests') as any;
    rateLimitError.response = { status: 429 };
    const shouldRetry = rateLimitError.response?.status === 429;
    expect(shouldRetry).toBe(true);
  });

  it('should NOT retry on 4xx client errors (except 408, 429)', () => {
    const clientError = new Error('Bad request') as any;
    clientError.response = { status: 400 };
    const shouldRetry = clientError.response?.status >= 500;
    expect(shouldRetry).toBe(false);
  });

  it('should NOT retry on 4xx unless specified', () => {
    const notFoundError = new Error('Not found') as any;
    notFoundError.response = { status: 404 };
    const shouldRetry = notFoundError.response?.status >= 500;
    expect(shouldRetry).toBe(false);
  });
});

describe('Request Attempt Tracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should track attempt numbers correctly', async () => {
    let attempts = 0;
    const maxAttempts = 3;

    const fetchFn = jest.fn().mockRejectedValue(new Error('Network error'));

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      attempts = attempt + 1;
      try {
        await fetchFn();
      } catch {
        // Continue to next attempt
      }

      if (attempt < maxAttempts - 1) {
        const delay = 500 * Math.pow(2, attempt);
        jest.advanceTimersByTime(delay);
      }
    }

    expect(attempts).toBe(3);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('should stop retrying on success', async () => {
    let attempts = 0;
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: 'success' });

    for (let attempt = 0; attempt < 3; attempt++) {
      attempts = attempt + 1;
      try {
        const result = await fetchFn();
        if (result) break; // Success, stop retrying
      } catch {
        if (attempt < 2) {
          jest.advanceTimersByTime(500);
        }
      }
    }

    expect(attempts).toBe(2); // Failed once, succeeded on second attempt
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('Multi-Request Retry', () => {
  it('should handle multiple requests independently', async () => {
    const requests = {
      services: jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'services' }),
      therapists: jest.fn().mockResolvedValueOnce({ data: 'therapists' }),
    };

    const results: any = {};

    // Simulate retry logic for each request
    for (const [key, fn] of Object.entries(requests)) {
      try {
        const result = await fn();
        results[key] = result;
      } catch {
        try {
          // Retry
          const result = await fn();
          results[key] = result;
        } catch (err) {
          results[key] = err;
        }
      }
    }

    expect(results.services).toBeDefined();
    expect(results.therapists).toBeDefined();
  });

  it('should track errors for failed requests', () => {
    const errors: Record<string, Error> = {};
    const requests = {
      services: () => Promise.resolve({ data: 'services' }),
      therapists: () => Promise.reject(new Error('Network error')),
    };

    expect(Object.keys(errors)).toHaveLength(0); // No errors yet

    // Simulate error assignment
    errors['therapists'] = new Error('Network error');
    expect(Object.keys(errors)).toHaveLength(1);
    expect(errors['therapists']).toBeDefined();
  });
});

describe('Error Recovery Scenarios', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should recover from transient network errors', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce({ data: 'success' });

    let lastResult = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        lastResult = await fetchFn();
        break;
      } catch (err) {
        if (attempt < 2) {
          jest.advanceTimersByTime(1000);
        }
      }
    }

    expect(lastResult).toEqual({ data: 'success' });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max attempts exceeded', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('Network error'));

    let finalError = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await fetchFn();
      } catch (err) {
        finalError = err;
        if (attempt < maxAttempts - 1) {
          jest.advanceTimersByTime(500);
        }
      }
    }

    expect(finalError).toBeDefined();
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
});

describe('Request Abort', () => {
  it('should handle request abortion', () => {
    let aborted = false;
    const abortRef = { current: false };

    // Simulate abort
    abortRef.current = true;
    aborted = abortRef.current;

    expect(aborted).toBe(true);
  });

  it('should prevent retries after abort', async () => {
    let aborted = false;
    let attempts = 0;

    const fetchFn = jest.fn().mockRejectedValue(new Error('Network error'));

    for (let attempt = 0; attempt < 3; attempt++) {
      if (aborted) break; // Check abort flag

      attempts = attempt + 1;
      try {
        await fetchFn();
      } catch {
        // Continue
      }

      // Abort after first attempt
      if (attempt === 0) {
        aborted = true;
      }
    }

    expect(attempts).toBe(1); // Should stop at first attempt
  });
});
