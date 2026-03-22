/**
 * Jest Setup
 * Configure test environment
 */

// Define global variables
global.__DEV__ = false;

// Mock logger
jest.mock('./src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logApiCall: jest.fn(),
  },
}));

// Suppress console output in tests
global.console.log = jest.fn();
global.console.warn = jest.fn();
