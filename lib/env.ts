// Production environment variable validation
// This file ensures all critical environment variables are present before the app starts

const isProduction = process.env.NODE_ENV === 'production';

// Critical environment variables required in production
const requiredInProduction = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'SENDGRID_API_KEY', // Resend API key (using SENDGRID_API_KEY name)
  'EMAIL_FROM',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

// Optional but recommended in production
const recommendedInProduction = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'ENCRYPTION_KEY',
  'JWT_SECRET',
  'SESSION_SECRET',
];

/**
 * Validate environment variables
 * Call this at app startup (in a server component or API route)
 */
export function validateEnvironmentVariables() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredInProduction) {
    if (!process.env[varName]) {
      errors.push(`Missing critical environment variable: ${varName}`);
    }
  }

  // Check recommended variables
  if (isProduction) {
    for (const varName of recommendedInProduction) {
      if (!process.env[varName]) {
        warnings.push(`Missing recommended environment variable: ${varName}`);
      }
    }
  }

  // In production, fail fast on missing critical vars
  if (isProduction && errors.length > 0) {
    const message = `
❌ PRODUCTION ENVIRONMENT VALIDATION FAILED

The following critical environment variables are missing:
${errors.map((e) => `  - ${e}`).join('\n')}

Please set these variables in:
  1. Supabase Project Settings → Environment Variables
  2. Vercel Environment Variables (for your deployment)
  3. GitHub Actions secrets (if using CI/CD)

Deployment will be blocked until these are set.
    `;
    throw new Error(message);
  }

  // Warn about missing recommended vars in production
  if (isProduction && warnings.length > 0) {
    console.warn(
      '⚠️  PRODUCTION: Some recommended environment variables are missing:\n' +
        warnings.map((w) => `  - ${w}`).join('\n')
    );
  }

  // Log success in production
  if (isProduction) {
    console.log('✅ All critical environment variables validated');
  }
}

/**
 * Get a required environment variable with fallback
 */
export function getEnv(varName: string, fallback?: string): string {
  const value = process.env[varName] || fallback;
  if (!value && isProduction) {
    throw new Error(`Required environment variable not set: ${varName}`);
  }
  return value || '';
}

export const ENV_CONFIG = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  databaseUrl: process.env.DATABASE_URL,

  // Email
  sendgridApiKey: process.env.SENDGRID_API_KEY, // Actually Resend key
  emailFrom: process.env.EMAIL_FROM,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // App config
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  nodeEnv: process.env.NODE_ENV,

  // Security
  encryptionKey: process.env.ENCRYPTION_KEY,
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  authSecret: process.env.AUTH_SECRET,

  // Feature flags
  enableLegalAssistant: process.env.NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT === 'true',
  enableConcierge: process.env.NEXT_PUBLIC_ENABLE_CONCIERGE === 'true',
  enableCustomBranding: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING === 'true',
};
