/**
 * Advanced logging system with different levels and transports
 * Useful for debugging and monitoring in production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  context?: string;
  data?: any;
  stack?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  maxLogs: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.DEBUG,
      maxLogs: 500,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    stack?: string
  ): LogEntry {
    return {
      level,
      timestamp: Date.now(),
      message,
      context,
      data,
      stack,
    };
  }

  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const time = new Date(entry.timestamp).toISOString();
    const ctx = entry.context ? `[${entry.context}]` : '';
    const prefix = `${time} ${levelName} ${ctx}`;
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';

    return `${prefix} ${entry.message}${dataStr}`;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep logs manageable
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }
  }

  private async sendRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteUrl) {
      return;
    }

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't log remote failures to avoid recursion
      });
    } catch (error) {
      // Silently fail
    }
  }

  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createEntry(LogLevel.DEBUG, message, context, data);
    this.addLog(entry);

    if (this.config.enableConsole) {
      console.log(this.formatLog(entry));
    }
  }

  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createEntry(LogLevel.INFO, message, context, data);
    this.addLog(entry);

    if (this.config.enableConsole) {
      console.log(this.formatLog(entry));
    }
  }

  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createEntry(LogLevel.WARN, message, context, data);
    this.addLog(entry);

    if (this.config.enableConsole) {
      console.warn(this.formatLog(entry));
    }
  }

  error(message: string, error?: Error | string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorMessage = typeof error === 'string' ? error : error?.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const entry = this.createEntry(
      LogLevel.ERROR,
      message,
      context,
      { ...data, originalError: errorMessage },
      errorStack
    );
    this.addLog(entry);

    if (this.config.enableConsole) {
      console.error(this.formatLog(entry));
      if (errorStack) {
        console.error('Stack:', errorStack);
      }
    }

    // Send to remote for error tracking
    this.sendRemote(entry);
  }

  /**
   * Log API call with timing
   */
  logApiCall(
    method: string,
    endpoint: string,
    statusCode?: number,
    durationMs?: number,
    error?: any
  ): void {
    const status = statusCode ? ` (${statusCode})` : '';
    const duration = durationMs ? ` in ${durationMs}ms` : '';
    const message = `${method} ${endpoint}${status}${duration}`;

    if (statusCode && statusCode >= 400) {
      this.error(message, error, 'API', {
        method,
        endpoint,
        statusCode,
        durationMs,
      });
    } else {
      this.debug(message, 'API', { method, endpoint, statusCode, durationMs });
    }
  }

  /**
   * Log performance metric
   */
  logMetric(name: string, value: number, unit: string = 'ms', context?: string): void {
    this.debug(`${name}: ${value}${unit}`, context || 'METRIC');
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs as formatted strings
   */
  getFormattedLogs(): string[] {
    return this.logs.map((entry) => this.formatLog(entry));
  }

  /**
   * Export logs as JSON
   */
  exportLogs(filters?: { level?: LogLevel; context?: string }): LogEntry[] {
    return this.logs.filter((entry) => {
      if (filters?.level !== undefined && entry.level !== filters.level) {
        return false;
      }
      if (filters?.context && entry.context !== filters.context) {
        return false;
      }
      return true;
    });
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Get log statistics
   */
  getStats(): { total: number; byLevel: Record<string, number> } {
    const byLevel: Record<string, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
    };

    this.logs.forEach((entry) => {
      byLevel[LogLevel[entry.level]]++;
    });

    return {
      total: this.logs.length,
      byLevel,
    };
  }
}

// Singleton instance
const defaultConfig: Partial<LoggerConfig> = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
};

export const logger = new Logger(defaultConfig);

/**
 * Factory function to create isolated logger instances
 * Useful for specific domains (API, Auth, Payments, etc.)
 */
export const createLogger = (name: string, config?: Partial<LoggerConfig>) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, name, data),
    info: (message: string, data?: any) => logger.info(message, name, data),
    warn: (message: string, data?: any) => logger.warn(message, name, data),
    error: (message: string, error?: Error | string, data?: any) =>
      logger.error(message, error, name, data),
  };
};

// Export logger instance for global use
export default logger;
