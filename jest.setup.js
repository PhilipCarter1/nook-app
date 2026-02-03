// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: null, status: 'unauthenticated' };
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
}));

// Mock Resend
jest.mock('@/lib/email/client', () => ({
  resend: {
    emails: {
      send: jest.fn(),
    },
  },
  sendWelcomeEmail: jest.fn(),
  sendPaymentConfirmationEmail: jest.fn(),
  sendMaintenanceUpdateEmail: jest.fn(),
  sendLeaseExpirationReminder: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.STRIPE_SECRET_KEY = 'test-secret-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_NAME = 'Nook';
process.env.NEXT_PUBLIC_APP_DESCRIPTION = 'Modern Property Management Platform';
process.env.NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT = 'true';
process.env.NEXT_PUBLIC_ENABLE_CONCIERGE = 'true';
process.env.NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING = 'true'; 

// Keep compatibility: tests expect SENDGRID_API_KEY to exist; set to same test key
process.env.SENDGRID_API_KEY = process.env.RESEND_API_KEY;