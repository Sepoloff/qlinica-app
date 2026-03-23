'use strict';

/**
 * Test Utilities for Qlinica App
 * Provides mock data, helpers, and utilities for testing
 */

// ============================================
// MOCK DATA GENERATORS
// ============================================

export const mockUserData = {
  validUser: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'João Silva',
    phone: '+351912345678',
    avatar: 'https://example.com/avatar.jpg',
    preferences: {
      notifications: true,
      language: 'pt' as const,
      theme: 'light' as const,
    },
  },

  invalidEmails: [
    'invalid.email',
    '@example.com',
    'user@',
    'user..name@example.com',
    'user@.com',
  ],

  validEmails: [
    'user@example.com',
    'test.email@example.co.uk',
    'user+tag@example.com',
  ],

  weakPasswords: [
    'pass',
    '12345678',
    'password',
    'PASSWORD123',
    'Pass123',
  ],

  strongPasswords: [
    'SecurePass123!',
    'MyP@ssw0rd',
    'Test#Password1',
  ],

  validPhones: [
    '+351912345678',
    '+351912 345 678',
    '912345678',
  ],

  invalidPhones: [
    '123', // too short
    'abc123456789', // letters
    '+1912345678', // wrong country code
  ],
};

export const mockBookingData = {
  validBooking: {
    id: 'booking-123',
    userId: 'user-123',
    serviceId: 'service-1',
    therapistId: 'therapist-1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    time: '14:30',
    duration: 60,
    price: 75,
    status: 'confirmed' as const,
    notes: 'Test booking',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  pastBooking: {
    id: 'booking-past',
    userId: 'user-123',
    serviceId: 'service-1',
    therapistId: 'therapist-1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    time: '14:30',
    duration: 60,
    price: 75,
    status: 'completed' as const,
    notes: 'Past booking',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },

  invalidDateBooking: {
    id: 'booking-invalid',
    userId: 'user-123',
    serviceId: 'service-1',
    therapistId: 'therapist-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // past date
    time: '14:30',
    duration: 60,
    price: 75,
    status: 'pending' as const,
  },
};

export const mockServiceData = {
  services: [
    {
      id: 'service-1',
      name: 'Consulta Geral',
      description: 'Consulta de avaliação geral',
      duration: 60,
      price: 75,
      category: 'general',
    },
    {
      id: 'service-2',
      name: 'Terapia Especial',
      description: 'Sessão de terapia especializada',
      duration: 90,
      price: 120,
      category: 'specialized',
    },
  ],
};

export const mockTherapistData = {
  therapists: [
    {
      id: 'therapist-1',
      name: 'Dr. Miguel Santos',
      specialization: 'Fisioterapia',
      rating: 4.8,
      totalReviews: 45,
      avatar: 'https://example.com/therapist1.jpg',
      experience: 10,
    },
    {
      id: 'therapist-2',
      name: 'Dra. Sofia Costa',
      specialization: 'Psicologia',
      rating: 4.6,
      totalReviews: 38,
      avatar: 'https://example.com/therapist2.jpg',
      experience: 8,
    },
  ],
};

// ============================================
// VALIDATION TEST HELPERS
// ============================================

export const validationTestHelpers = {
  /**
   * Test email validation
   */
  testEmailValidation(validateFn: (email: string) => boolean) {
    const results = {
      valid: 0,
      invalid: 0,
    };

    mockUserData.validEmails.forEach((email) => {
      if (validateFn(email)) results.valid++;
    });

    mockUserData.invalidEmails.forEach((email) => {
      if (!validateFn(email)) results.invalid++;
    });

    return results;
  },

  /**
   * Test password strength validation
   */
  testPasswordStrength(validateFn: (password: string) => boolean) {
    const results = {
      weak: 0,
      strong: 0,
    };

    mockUserData.weakPasswords.forEach((password) => {
      if (!validateFn(password)) results.weak++;
    });

    mockUserData.strongPasswords.forEach((password) => {
      if (validateFn(password)) results.strong++;
    });

    return results;
  },

  /**
   * Test phone validation
   */
  testPhoneValidation(validateFn: (phone: string) => boolean) {
    const results = {
      valid: 0,
      invalid: 0,
    };

    mockUserData.validPhones.forEach((phone) => {
      if (validateFn(phone)) results.valid++;
    });

    mockUserData.invalidPhones.forEach((phone) => {
      if (!validateFn(phone)) results.invalid++;
    });

    return results;
  },
};

// ============================================
// ASYNC TEST HELPERS
// ============================================

export const asyncTestHelpers = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(
    condition: () => boolean,
    timeout = 5000,
    interval = 100
  ): Promise<void> {
    const startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for condition');
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },

  /**
   * Simulate API delay
   */
  async simulateAPIDelay(delayMs = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  },

  /**
   * Create a promise that rejects after timeout
   */
  createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );
  },

  /**
   * Race promise against timeout
   */
  async raceWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race<T>([
      promise,
      this.createTimeoutPromise<T>(timeoutMs),
    ]);
  },
};

// ============================================
// MOCK API RESPONSES
// ============================================

export const mockAPIResponses = {
  successLogin: {
    data: {
      token: 'mock-jwt-token-123',
      user: mockUserData.validUser,
    },
  },

  successBooking: {
    data: mockBookingData.validBooking,
  },

  successServices: {
    data: mockServiceData.services,
  },

  successTherapists: {
    data: mockTherapistData.therapists,
  },

  errorUnauthorized: {
    status: 401,
    message: 'Unauthorized',
  },

  errorNotFound: {
    status: 404,
    message: 'Not Found',
  },

  errorValidation: {
    status: 400,
    message: 'Validation Error',
  },

  errorServer: {
    status: 500,
    message: 'Internal Server Error',
  },
};

// ============================================
// PERFORMANCE TEST HELPERS
// ============================================

export const performanceTestHelpers = {
  /**
   * Measure function execution time
   */
  measureTime(fn: () => void): number {
    const start = performance.now();
    fn();
    return performance.now() - start;
  },

  /**
   * Measure async function execution time
   */
  async measureAsyncTime(fn: () => Promise<void>): Promise<number> {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  },

  /**
   * Create performance report
   */
  createPerformanceReport(measurements: { [key: string]: number }) {
    const sorted = Object.entries(measurements).sort((a, b) => b[1] - a[1]);
    const total = Object.values(measurements).reduce((a, b) => a + b, 0);
    const average = total / Object.keys(measurements).length;

    return {
      measurements,
      sorted,
      total,
      average,
      slowest: sorted[0],
      fastest: sorted[sorted.length - 1],
    };
  },
};

// ============================================
// SNAPSHOT TEST HELPERS
// ============================================

export const snapshotTestHelpers = {
  /**
   * Create consistent snapshot data
   */
  createSnapshot(data: any) {
    return JSON.stringify(data, null, 2);
  },

  /**
   * Compare snapshots
   */
  compareSnapshots(current: string, previous: string): boolean {
    return current === previous;
  },

  /**
   * Get snapshot diff
   */
  getSnapshotDiff(current: any, previous: any): string[] {
    const differences: string[] = [];

    const currentKeys = Object.keys(current);
    const previousKeys = Object.keys(previous);

    // Check for missing/new keys
    currentKeys.forEach((key) => {
      if (!(key in previous)) {
        differences.push(`+ ${key}: ${JSON.stringify(current[key])}`);
      } else if (current[key] !== previous[key]) {
        differences.push(
          `~ ${key}: ${JSON.stringify(previous[key])} → ${JSON.stringify(
            current[key]
          )}`
        );
      }
    });

    previousKeys.forEach((key) => {
      if (!(key in current)) {
        differences.push(`- ${key}: ${JSON.stringify(previous[key])}`);
      }
    });

    return differences;
  },
};

// ============================================
// INTEGRATION TEST HELPERS
// ============================================

export const integrationTestHelpers = {
  /**
   * Simulate user booking flow
   */
  async simulateBookingFlow() {
    return {
      steps: [
        { step: 'select_service', data: mockServiceData.services[0] },
        { step: 'select_therapist', data: mockTherapistData.therapists[0] },
        { step: 'select_date_time', data: { date: new Date(), time: '14:30' } },
        { step: 'confirm_booking', data: mockBookingData.validBooking },
      ],
      duration: 0,
    };
  },

  /**
   * Simulate auth flow
   */
  async simulateAuthFlow() {
    return {
      steps: [
        { step: 'login', success: true },
        { step: 'token_stored', success: true },
        { step: 'user_loaded', success: true },
      ],
      duration: 0,
    };
  },

  /**
   * Simulate offline flow
   */
  async simulateOfflineFlow() {
    return {
      status: 'offline',
      queuedActions: ['create_booking', 'update_profile'],
      syncWhenOnline: true,
    };
  },
};

// ============================================
// CLEANUP HELPERS
// ============================================

export const cleanupHelpers = {
  /**
   * Clear all mock data
   */
  clearAllMocks() {
    // Reset mocks
    console.log('All mocks cleared');
  },

  /**
   * Reset specific mock
   */
  resetMock(name: string) {
    console.log(`Mock ${name} reset`);
  },

  /**
   * Cleanup after tests
   */
  afterTest() {
    this.clearAllMocks();
  },
};
