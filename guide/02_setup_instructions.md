# Setup Instructions for Nook

This guide walks you through setting up the Nook rental SaaS application locally and preparing it for deployment.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Deployment to Vercel](#deployment-to-vercel)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18 or higher (check with `node --version`)
- **npm** or **pnpm**: v9+ (check with `npm --version`)
- **Git**: For version control
- **A Supabase account**: Free tier is sufficient for development

### Step 1: Clone or Download the Repository

```bash
# If cloning from GitHub
git clone <your-repo-url>
cd nook-app

# Or if you have a zip file
unzip nook-app.zip
cd nook-app
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install
```

This installs all required packages listed in `package.json`.

### Step 3: Create Environment Configuration

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Now open `.env.local` and fill in the required values (see next section).

---

## Environment Configuration

### Step 1: Set Up Supabase

Follow the instructions in `guide/01_supabase_restoration.md` to:

1. Create a new Supabase project
2. Restore your database backup
3. Restore your storage buckets
4. Get your API credentials

### Step 2: Update `.env.local`

Open `.env.local` and fill in the **required** values:

```env
# Required: From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..." (long key)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..." (long key)

# Security secrets (generate new ones for production)
AUTH_SECRET="your-random-secret-here"
JWT_SECRET="your-random-secret-here"
SESSION_SECRET="your-random-secret-here"
ENCRYPTION_KEY="your-random-secret-here"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 3: Generate Security Secrets (Optional but Recommended)

Generate secure random secrets for development/production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for:
- `AUTH_SECRET`
- `JWT_SECRET`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`

### Step 4: Optional Services

If you plan to test payment or email features:

- **Stripe**: Get keys from https://dashboard.stripe.com/apikeys (test mode)
- **SendGrid**: Get API key from https://app.sendgrid.com/settings/api_keys

---

## Database Setup

### Automatic Setup (Recommended)

The application will automatically create necessary tables and policies when you first run it, provided your Supabase project is properly configured.

### Manual Setup (If Needed)

If you encounter database errors, manually run migrations:

```bash
# Run Drizzle migrations
npm run db:push

# Or manually execute SQL files
# Go to Supabase SQL Editor and paste contents from:
# supabase/migrations/*.sql (in order by filename)
```

---

## Running the Application

### Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Create Test Accounts

Once the server is running, test the authentication flow:

1. Visit `http://localhost:3000/signup`
2. Create a test account with a unique email
3. Select a role:
   - **Landlord**: Property owner (can approve documents, view payments)
   - **Tenant**: Renter (can upload documents, pay rent)
   - **Property Manager**: Manages properties for landlords
   - **Super**: Building superintendent (handles maintenance)
   - **Admin**: System administrator

4. After signup, you should be redirected to your role-specific dashboard

### Verify Dashboards by Role

Test that each role sees the correct dashboard:

| Role | Expected Route | Features |
|------|---|---|
| Tenant | `/dashboard/tenant` | View leases, upload documents, pay rent |
| Landlord | `/dashboard/landlord` | Approve documents, view tenants, manage properties |
| Property Manager | `/dashboard/manager` | Manage properties, view assignments |
| Super | `/super/dashboard` | Create/manage maintenance tickets |
| Admin | `/admin/dashboard` | System administration |

---

## Testing

### Run Unit Tests

```bash
# Run all unit tests once
npm run test:unit

# Or watch mode for development
npm run test:unit:watch
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific role tests
npm run test:e2e:tenant
npm run test:e2e:landlord
npm run test:e2e:admin

# Run with UI (interactive mode)
npm run test:e2e:ui

# View last test report
npm run test:e2e:report
```

### Run Specific Test Suites

```bash
# Authentication tests
npm run test:e2e:auth

# Core features
npm run test:e2e:features

# UI/UX tests
npm run test:e2e:ui-ux
```

---

## Deployment to Vercel

### Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository (Vercel integrates with GitHub)

### Step 1: Connect Supabase to Vercel Environment

1. Log in to your Vercel dashboard
2. Select your Nook project (or create a new one)
3. Go to **Settings → Environment Variables**
4. Add all required variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
JWT_SECRET
SESSION_SECRET
ENCRYPTION_KEY
```

### Step 2: Deploy from Git

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. In Vercel dashboard, click **"New Project"**
3. Select your GitHub repository
4. Vercel will automatically deploy on every push to `main` branch

### Step 3: Configure Vercel Settings

In Vercel project settings:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Set Production Environment Variables

In Vercel Settings → Environment Variables:

1. Set all variables for **Production** environment
2. Use production Supabase project (different from development)
3. Use production Stripe keys (if applicable)
4. Generate new secure secrets for production

### Step 5: Test Production Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://nook-app.vercel.app`)
2. Test the signup/login flow
3. Verify role-based redirects work
4. Check browser console for errors

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

```bash
# Solution: Install dependencies
npm install
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not set"

```bash
# Solution: Create .env.local with Supabase credentials
cp .env.example .env.local
# Then edit .env.local and fill in values
```

### Issue: "PGRST116" or "RLS policy violation" errors

This means Row Level Security policies are preventing access. Solutions:

1. Verify user exists in `users` table (Supabase Dashboard → Table Editor)
2. Check RLS policies in Supabase Settings → Authentication → Policies
3. For development, temporarily relax RLS (but tighten for production)

### Issue: "User not found" after login

1. Check that `public.users` table exists and has columns:
   - `id`, `email`, `first_name`, `last_name`, `role`, `created_at`
2. Verify the user was created during signup (check in Table Editor)
3. Check AuthProvider logs in browser console

### Issue: "Redirect to wrong dashboard" after login

1. Check user's `role` field in `public.users` table
2. Verify role is one of: `tenant`, `landlord`, `property_manager`, `super`, `admin`
3. Check auth-provider.tsx for role-to-route mapping

### Issue: Build fails on Vercel

Common causes and solutions:

1. **Type errors**: Run `npm run build` locally to catch errors before deploying
2. **Missing environment variables**: Ensure all required vars are set in Vercel
3. **Database migration issues**: Run migrations manually before deploying

### Issue: "Cannot access Supabase from Vercel"

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check Supabase project is not paused
3. Verify network access isn't blocked (Supabase has no IP restrictions on free tier)

---

## Next Steps

1. **Fix Authentication Issues**: See `ROLE_BASED_ACCESS_IMPLEMENTATION.md`
2. **Set Up Features**:
   - Enable maintenance tickets
   - Enable payments
   - Enable document management
3. **Customize for Your Needs**: Update branding, colors, features
4. **Move to Production**: Set up production Supabase project and Vercel deployment

---

**Need Help?**

- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
