import * as Sentry from '@sentry/nextjs';
import { AppError } from './error';

// Initialize Sentry
export function initMonitoring() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', 'app.nook.app'],
        }),
      ],
    });
  }
}

// Capture errors
export function captureError(error: Error | AppError) {
  if (error instanceof AppError) {
    Sentry.withScope((scope) => {
      scope.setExtra('statusCode', error.statusCode);
      scope.setExtra('errors', error.errors);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

// Capture messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

// Set user context
export function setUserContext(user: { id: string; email: string; role: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

// Clear user context
export function clearUserContext() {
  Sentry.setUser(null);
}

// Add custom tags
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// Add custom context
export function setContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

// Start a new transaction
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

// Performance monitoring
export function withPerformanceMonitoring<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, operation);
  
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    async () => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        captureError(error as Error);
        throw error;
      } finally {
        transaction.finish();
      }
    }
  );
}

// API route monitoring
export function withApiMonitoring(handler: Function) {
  return async (req: any, res: any) => {
    const transaction = startTransaction(
      `${req.method} ${req.url}`,
      'http.server'
    );
    
    try {
      await handler(req, res);
    } catch (error) {
      captureError(error as Error);
      throw error;
    } finally {
      transaction.finish();
    }
  };
}

// Database query monitoring
export function withQueryMonitoring<T>(
  queryName: string,
  fn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(
    `Database Query: ${queryName}`,
    'db.query',
    fn
  );
}

// File operation monitoring
export function withFileOperationMonitoring<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(
    `File Operation: ${operationName}`,
    'file.operation',
    fn
  );
}

// External API call monitoring
export function withExternalApiMonitoring<T>(
  apiName: string,
  fn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(
    `External API: ${apiName}`,
    'http.client',
    fn
  );
}

// Custom performance monitoring
export function withCustomMonitoring<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(name, operation, fn);
} 