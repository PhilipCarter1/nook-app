import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }
    
    if (this.isProduction) {
      // In production, only log warn and error by default
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }
    
    return true;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    if (this.isDevelopment) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    if (this.isDevelopment) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
    
    // Send to Sentry in production
    if (this.isProduction) {
      Sentry.withScope((scope) => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        scope.setLevel('warning');
        Sentry.captureMessage(message, 'warning');
      });
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    if (this.isDevelopment) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
      if (error) {
        console.error(error);
      }
    }
    
    // Send to Sentry in production
    if (this.isProduction) {
      Sentry.withScope((scope) => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        scope.setLevel('error');
        if (error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      });
    }
  }

  // Service-specific logging methods
  service(serviceName: string, action: string, context?: LogContext): void {
    this.info(`${serviceName}: ${action}`, context);
  }

  serviceError(serviceName: string, action: string, error: Error, context?: LogContext): void {
    this.error(`${serviceName}: ${action} failed`, error, context);
  }

  api(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API ${method} ${endpoint}`, context);
  }

  apiError(method: string, endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API ${method} ${endpoint} failed`, error, context);
  }

  user(userId: string, action: string, context?: LogContext): void {
    this.info(`User ${userId}: ${action}`, { userId, ...context });
  }

  userError(userId: string, action: string, error: Error, context?: LogContext): void {
    this.error(`User ${userId}: ${action} failed`, error, { userId, ...context });
  }

  payment(paymentId: string, action: string, context?: LogContext): void {
    this.info(`Payment ${paymentId}: ${action}`, { paymentId, ...context });
  }

  paymentError(paymentId: string, action: string, error: Error, context?: LogContext): void {
    this.error(`Payment ${paymentId}: ${action} failed`, error, { paymentId, ...context });
  }

  maintenance(ticketId: string, action: string, context?: LogContext): void {
    this.info(`Maintenance ${ticketId}: ${action}`, { ticketId, ...context });
  }

  maintenanceError(ticketId: string, action: string, error: Error, context?: LogContext): void {
    this.error(`Maintenance ${ticketId}: ${action} failed`, error, { ticketId, ...context });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
  service: (serviceName: string, action: string, context?: LogContext) => logger.service(serviceName, action, context),
  serviceError: (serviceName: string, action: string, error: Error, context?: LogContext) => logger.serviceError(serviceName, action, error, context),
  api: (method: string, endpoint: string, context?: LogContext) => logger.api(method, endpoint, context),
  apiError: (method: string, endpoint: string, error: Error, context?: LogContext) => logger.apiError(method, endpoint, error, context),
  user: (userId: string, action: string, context?: LogContext) => logger.user(userId, action, context),
  userError: (userId: string, action: string, error: Error, context?: LogContext) => logger.userError(userId, action, error, context),
  payment: (paymentId: string, action: string, context?: LogContext) => logger.payment(paymentId, action, context),
  paymentError: (paymentId: string, action: string, error: Error, context?: LogContext) => logger.paymentError(paymentId, action, error, context),
  maintenance: (ticketId: string, action: string, context?: LogContext) => logger.maintenance(ticketId, action, context),
  maintenanceError: (ticketId: string, action: string, error: Error, context?: LogContext) => logger.maintenanceError(ticketId, action, error, context),
}; 