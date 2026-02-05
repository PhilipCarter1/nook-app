# Nook MVP - Production Deployment Guide

**Last Updated:** February 4, 2026  
**Status:** Ready for Production

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Stripe Integration](#stripe-integration)
5. [Email Service Setup](#email-service-setup)
6. [Deployment to Vercel](#deployment-to-vercel)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Support](#monitoring--support)

---

## Pre-Deployment Checklist

- [ ] All environment variables configured in `.env.local`
- [ ] Supabase project created and tables migrated
- [ ] Stripe account set up with test keys
- [ ] Resend account created with API key
- [ ] GitHub repository connected to Vercel
- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Security headers enabled in next.config.cjs
- [ ] RLS policies verified in Supabase
- [ ] Rate limiting configured

---

## Environment Setup

### 1. Copy the Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

#### Supabase Configuration
```dotenv
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..." # NEVER expose to browser
DATABASE_URL="postgresql://user:password@..."
```

**How to get these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy the URL, Anon Key, and Service Role Key

#### Stripe Configuration
```dotenv
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers → API Keys**
3. Copy the Secret Key and Publishable Key
4. Create a price/product for your subscription
5. Create a webhook endpoint (see next section)

#### Email Service
```dotenv
RESEND_API_KEY="re_..."  # From https://resend.com/api-keys
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Nook Team"
```

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click **New Project**
3. Select your organization and region (closest to your users)
4. Set a strong password for the postgres user
5. Wait for the project to initialize

### 2. Enable Authentication

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended):
   - Go to **Auth Templates**
   - Customize email content if needed
4. Enable email confirmations:
   - Go to **Authentication → Settings**
   - Under **Email Auth**, toggle **Confirm email**

### 3. Create Database Tables

The app uses the following main tables. Verify they exist:

```sql
-- Users table (with role enum)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'tenant', -- tenant, landlord, admin, super
  stripe_customer_id TEXT,
  phone TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL, -- apartment, house, condo, etc.
  monthly_rent NUMERIC NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leases table
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lease_id UUID REFERENCES leases(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, expired
  error_message TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Enable Row Level Security (RLS)

RLS ensures users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users: Each user can only see their own profile
CREATE POLICY "Users can see own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Properties: Landlords see their properties, tenants see properties with leases
CREATE POLICY "Landlords see own properties" ON properties
  FOR SELECT USING (auth.uid() = landlord_id);

-- Leases: Users see their own leases
CREATE POLICY "Users see own leases" ON leases
  FOR SELECT USING (auth.uid() = tenant_id OR (SELECT auth.uid() = landlord_id FROM properties WHERE id = property_id));

-- Payments: Users see their own payments
CREATE POLICY "Users see own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Stripe Integration

### 1. Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the Webhook Secret to `STRIPE_WEBHOOK_SECRET` env var

### 2. Create a Product and Price

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Enter product details (e.g., "Monthly Subscription")
4. Under **Pricing**, click **Add price**
5. Set amount and billing period
6. Copy the Price ID to `STRIPE_PRICE_ID` env var

### 3. Test Stripe Integration

**In Development (with test keys):**
```bash
# Use Stripe test card for testing
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**In Production:**
- Use live keys instead of test keys
- Test all payment flows before going live

---

## Email Service Setup

### 1. Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up and verify email
3. Go to **API Keys**
4. Create a new API key
5. Copy the key to `RESEND_API_KEY` env var

### 2. Verify Sender Domain (Production)

For production, verify your domain:

1. Go to **Domains** in Resend
2. Click **Add Domain**
3. Enter your domain
4. Follow DNS verification steps
5. Update `EMAIL_FROM` to `noreply@yourdomain.com`

**For Development:**
- Use `onboarding@resend.dev` (provided by Resend for testing)

---

## Deployment to Vercel

### 1. Connect GitHub Repository

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Select your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 2. Add Environment Variables

1. Go to **Settings → Environment Variables**
2. Add all variables from `.env.local` (do NOT commit secrets to git)
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is only set for **Production**

### 3. Deploy

1. Click **Deploy**
2. Monitor deployment progress
3. Once complete, note your production URL:
   ```
   https://your-app.vercel.app
   ```

### 4. Update Supabase Redirect URLs

1. Go to Supabase **Authentication → Settings**
2. Under **Redirect URLs**, add:
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback (for development)
   ```

### 5. Update Stripe Configuration

1. Go to Stripe **Settings → Webhooks**
2. Update webhook URL to your production URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
3. Update your app's Stripe keys to production keys

---

## Post-Deployment Verification

### 1. Test User Authentication
- [ ] Sign up new user
- [ ] Verify email
- [ ] Log in with email/password
- [ ] Log out

### 2. Test Payment Flow
- [ ] Create a payment
- [ ] Complete Stripe checkout
- [ ] Verify payment status updates in database
- [ ] Verify payment email received

### 3. Test RLS Policies
- [ ] User A cannot see User B's data
- [ ] User A can see their own data
- [ ] Landlord can see their properties
- [ ] Tenant can see their leases

### 4. Monitor Logs
- [ ] Check Vercel logs for errors
- [ ] Check Sentry for exceptions
- [ ] Monitor database performance
- [ ] Check Stripe webhook logs

---

## Monitoring & Support

### 1. Sentry Error Tracking

Errors are automatically sent to Sentry. View them at:
```
https://sentry.io/organizations/your-org/projects/nook
```

### 2. Database Backups

Supabase automatically backs up your database. Manage backups:
1. Go to **Database → Backups**
2. Set backup frequency (daily recommended)
3. Restore from backup if needed

### 3. Scaling Considerations

As you grow:
- Monitor database performance (Supabase dashboard)
- Set up database indexes for frequently queried fields
- Consider caching with Redis
- Monitor rate limits
- Scale Stripe rate limits if needed

### 4. Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Resend Docs:** https://resend.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

---

## Troubleshooting

### Payments Not Processing

1. Check Stripe webhook logs:
   - Go to Stripe **Developers → Webhooks**
   - View recent events
2. Check Vercel logs for webhook errors:
   - Go to Vercel **Deployments → Logs**
3. Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint
4. Check database - payments table should have records

### Email Not Sending

1. Check Resend logs at https://resend.com
2. Verify `RESEND_API_KEY` is set correctly
3. Check `EMAIL_FROM` matches verified domain
4. In development, emails go to console (mock mode)

### Users Can't Log In

1. Verify Supabase auth is enabled
2. Check Supabase **Authentication → Providers → Email** is enabled
3. Verify user exists in `users` table
4. Check for errors in Sentry

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project status
3. Verify IP is whitelisted (Supabase allows all IPs by default)
4. Check network connectivity from Vercel region

---

## Security Checklist

- [ ] All secrets stored in Vercel Environment Variables (never in code)
- [ ] SUPABASE_SERVICE_ROLE_KEY only in production environment
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CSP headers configured
- [ ] HSTS header enabled
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Stripe webhook signature verified
- [ ] Email verification enabled
- [ ] Passwords hashed (Supabase handles this)

---

## Going Live Checklist

Before launching to production:

- [ ] All critical features tested end-to-end
- [ ] Performance meets requirements (< 2s page load)
- [ ] Security audit completed
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring and alerting set up
- [ ] Backup and disaster recovery plan
- [ ] Support process documented
- [ ] Terms of Service and Privacy Policy prepared
- [ ] Customer support email set up
- [ ] Analytics configured (optional)

---

## Next Steps

1. **First 24 hours:** Monitor all system metrics closely
2. **First week:** Run through all features with real data
3. **First month:** Gather user feedback and iterate
4. **Ongoing:** Regular security updates and monitoring

For questions or issues, contact the development team or refer to the troubleshooting section above.
