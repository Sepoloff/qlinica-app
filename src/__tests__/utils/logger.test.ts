import { Logger, LogLevel, createLogger } from '../../utils/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({
      minLevel: LogLevel.DEBUG,
      enableConsole: false,
      enableRemote: false,
    });
  });

  describe('Basic logging methods', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message', 'TestContext', { key: 'value' });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].message).toBe('Test debug message');
      expect(logs[0].context).toBe('TestContext');
      expect(logs[0].data).toEqual({ key: 'value' });
    });

    it('should log info messages', () => {
      logger.info('Test info message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Test info message');
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message', 'Warnings');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      logger.error('Something failed', error, 'ErrorContext');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].stack).toBe(error.stack);
      expect(logs[0].data.originalError).toBe('Test error');
    });

    it('should log error messages with string error', () => {
      logger.error('Something failed', 'String error message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].data.originalError).toBe('String error message');
    });
  });

  describe('Log level filtering', () => {
    it('should respect minimum log level', () => {
      logger.setMinLevel(LogLevel.WARN);

      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warn('Should appear');
      logger.error('Should appear');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[1].level).toBe(LogLevel.ERROR);
    });

    it('should respect initial minLevel config', () => {
      const restrictiveLogger = new Logger({
        minLevel: LogLevel.ERROR,
        enableConsole: false,
      });

      restrictiveLogger.debug('Should not appear');
      restrictiveLogger.info('Should not appear');
      restrictiveLogger.warn('Should not appear');
      restrictiveLogger.error('Should appear');

      const logs = restrictiveLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });
  });

  describe('Log retrieval and filtering', () => {
    beforeEach(() => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
    });

    it('should return all logs', () => {
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
    });

    it('should filter logs by level', () => {
      const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toBe('Error message');
    });

    it('should return formatted logs', () => {
      const formatted = logger.getFormattedLogs();
      expect(formatted).toHaveLength(4);
      expect(typeof formatted[0]).toBe('string');
      expect(formatted[0]).toContain('DEBUG');
      expect(formatted[0]).toContain('Debug message');
    });

    it('should export logs with filters', () => {
      logger.clear();
      logger.debug('Debug 1', 'Context1');
      logger.debug('Debug 2', 'Context2');
      logger.info('Info 1', 'Context1');

      const context1Logs = logger.exportLogs({ context: 'Context1' });
      expect(context1Logs).toHaveLength(2);

      const debugLogs = logger.exportLogs({ level: LogLevel.DEBUG });
      expect(debugLogs).toHaveLength(2);

      const specificLogs = logger.exportLogs({
        level: LogLevel.DEBUG,
        context: 'Context1',
      });
      expect(specificLogs).toHaveLength(1);
    });
  });

  describe('Special logging methods', () => {
    it('should log API calls', () => {
      logger.logApiCall('GET', '/api/bookings', 200, 120);

      const logs = logger.getLogs();
      expect(logs[0].message).toContain('GET');
      expect(logs[0].message).toContain('/api/bookings');
      expect(logs[0].message).toContain('200');
      expect(logs[0].message).toContain('120ms');
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should log API errors', () => {
      const error = new Error('Network error');
      logger.logApiCall('POST', '/api/bookings', 500, 500, error);

      const logs = logger.getLogs();
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].context).toBe('API');
    });

    it('should log metrics', () => {
      logger.logMetric('render_time', 45, 'ms', 'HomeScreen');

      const logs = logger.getLogs();
      expect(logs[0].message).toContain('render_time: 45ms');
      expect(logs[0].context).toBe('HomeScreen');
    });
  });

  describe('Log management', () => {
    it('should respect max logs limit', () => {
      const limitedLogger = new Logger({
        maxLogs: 5,
        enableConsole: false,
      });

      for (let i = 0; i < 10; i++) {
        limitedLogger.debug(`Message ${i}`);
      }

      const logs = limitedLogger.getLogs();
      expect(logs).toHaveLength(5);
      expect(logs[0].message).toBe('Message 5');
      expect(logs[4].message).toBe('Message 9');
    });

    it('should clear all logs', () => {
      logger.debug('Message 1');
      logger.debug('Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clear();

      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('Log statistics', () => {
    it('should provide log statistics', () => {
      logger.debug('Debug');
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const stats = logger.getStats();
      expect(stats.total).toBe(5);
      expect(stats.byLevel.DEBUG).toBe(2);
      expect(stats.byLevel.INFO).toBe(1);
      expect(stats.byLevel.WARN).toBe(1);
      expect(stats.byLevel.ERROR).toBe(1);
    });
  });

  describe('Logger factory', () => {
    it('should create logger instances with context', () => {
      const authLogger = createLogger('Auth');
      const apiLogger = createLogger('API');

      authLogger.debug('Auth debug');
      apiLogger.info('API info');

      const logs = logger.getLogs();
      // Note: createLogger uses the default logger singleton
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Timestamp handling', () => {
    it('should include timestamps in log entries', () => {
      const beforeTime = Date.now();
      logger.debug('Test message');
      const afterTime = Date.now();

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(logs[0].timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should include timestamps in formatted output', () => {
      logger.debug('Test');
      const formatted = logger.getFormattedLogs()[0];

      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO date format
    });
  });

  describe('Error handling', () => {
    it('should handle logging without data', () => {
      expect(() => {
        logger.debug('Message without data');
      }).not.toThrow();
    });

    it('should handle complex data structures', () => {
      const complexData = {
        nested: { value: 123 },
        array: [1, 2, 3],
        date: new Date(),
      };

      logger.debug('Complex data', 'Context', complexData);
      const logs = logger.getLogs();
      expect(logs[0].data).toBeDefined();
    });
  });
});
