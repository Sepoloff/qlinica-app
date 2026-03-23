/**
 * Centralized logging system for Qlinica app
 * Handles debug, info, warn, error with timestamps
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private currentLevel = LOG_LEVELS.DEBUG;
  private isDevelopment = __DEV__;

  setLevel(level: LogLevel) {
    this.currentLevel = LOG_LEVELS[level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment && LOG_LEVELS.DEBUG >= this.currentLevel) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any) {
    if (LOG_LEVELS.INFO >= this.currentLevel) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (LOG_LEVELS.WARN >= this.currentLevel) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: any) {
    if (LOG_LEVELS.ERROR >= this.currentLevel) {
      console.error(this.formatMessage('ERROR', message, error));
    }
  }

  /**
   * Track screen view for analytics
   */
  trackScreen(screenName: string, params?: any) {
    this.debug(`📱 Screen: ${screenName}`, params);
  }

  /**
   * Track user action
   */
  trackAction(action: string, data?: any) {
    this.info(`🎬 Action: ${action}`, data);
  }

  /**
   * Track API call
   */
  trackAPI(method: string, endpoint: string, status?: number) {
    this.debug(`🌐 ${method} ${endpoint}`, status ? { status } : undefined);
  }

  /**
   * Track error
   */
  trackError(context: string, error: any) {
    this.error(`❌ ${context}`, {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
  }
}

export const logger = new Logger();
