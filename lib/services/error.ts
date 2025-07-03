import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errors?: Record<string, string[]>,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, errors);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502);
    this.name = 'ExternalServiceError';
  }
}

export const ErrorCodes = {
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'AUTH001',
    SESSION_EXPIRED: 'AUTH002',
    UNAUTHORIZED: 'AUTH003',
    INVALID_TOKEN: 'AUTH004',
  },
  VALIDATION: {
    INVALID_INPUT: 'VAL001',
    MISSING_REQUIRED: 'VAL002',
    INVALID_FORMAT: 'VAL003',
  },
  MAINTENANCE: {
    TICKET_NOT_FOUND: 'MAINT001',
    INVALID_STATUS: 'MAINT002',
    VENDOR_UNAVAILABLE: 'MAINT003',
  },
  PAYMENT: {
    PAYMENT_FAILED: 'PAY001',
    INVALID_AMOUNT: 'PAY002',
    CARD_DECLINED: 'PAY003',
  },
  SYSTEM: {
    DATABASE_ERROR: 'SYS001',
    EXTERNAL_SERVICE_ERROR: 'SYS002',
    RATE_LIMIT_EXCEEDED: 'SYS003',
  },
} as const;

export function handleError(error: unknown, context?: string): void {
  if (error instanceof AppError) {
    // Log to Sentry with context
    Sentry.withScope((scope) => {
      scope.setExtra('errorCode', error.code);
      scope.setExtra('statusCode', error.statusCode);
      if (error.details) {
        scope.setExtra('details', error.details);
      }
      if (context) {
        scope.setTag('context', context);
      }
      Sentry.captureException(error);
    });

    // Show user-friendly error message
    toast.error(error.message);
  } else if (error instanceof Error) {
    // Log unknown errors to Sentry
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag('context', context);
      }
      Sentry.captureException(error);
    });

    // Show generic error message
    toast.error('An unexpected error occurred. Please try again later.');
  } else {
    // Log unknown error types
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag('context', context);
      }
      Sentry.captureMessage('Unknown error type', 'error');
    });

    toast.error('An unexpected error occurred. Please try again later.');
  }
}

export function createError(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: Record<string, any>
): AppError {
  return new AppError(message, statusCode, details as Record<string, string[]>, code, details);
}

// API error handler middleware
export async function withErrorHandling(
  handler: () => Promise<Response>,
  context?: string
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    handleError(error, context);
    
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
          details: error.errors,
        }),
        {
          status: error.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        code: ErrorCodes.SYSTEM.DATABASE_ERROR,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export { Sentry };

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getErrorStatus(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

export function getErrorDetails(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof AppError) {
    return error.errors;
  }
  return undefined;
} 