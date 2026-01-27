# Vercel & Cursor Deployment Guide

This guide covers deploying Nook to Vercel and previewing locally in Cursor.

## Table of Contents

1. [Cursor Preview](#cursor-preview)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)

---

## Cursor Preview

### Prerequisites

- Cursor IDE installed (https://cursor.com)
- Node.js v18+ installed
- Nook repository cloned locally
- `.env.local` file configured with Supabase credentials

### Step 1: Install Dependencies

```bash
cd nook-app
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Start Development Server in Cursor

In Cursor's terminal:

```bash
npm run dev
```

You'll see output like:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### Step 4: Open Preview

**Option A: Via Cursor's Browser**
- In Cursor, use **Preview** feature (usually Cmd+Shift+P → "Preview")
- Paste: `http://localhost:3000`

**Option B: External Browser**
- Open any browser
- Visit: `http://localhost:3000`

### Step 5: Test the App

1. **Home Page**: Should load with Nook branding
2. **Sign Up**: Click "Sign Up" tab, fill in form
3. **Test Account Creation**:
   - Email: `test-tenant-$(date +%s)@nook.app`
   - Password: `Nook123!@#` (meets complexity)
   - First Name: Test
   - Last Name: Tenant
   - Role: Tenant
   - Click "Create Account"

4. **Check Email**: Go to Supabase → Authentication → Users
   - Find your new user
   - Copy the verification link (if needed) or use the email confirmation from Supabase

5. **Login & Verify Redirect**:
   - Go to `/login`
   - Enter your test email and password
   - Should redirect to `/dashboard/tenant`
   - Check browser console (F12) for auth logs

### Debugging in Cursor

**View Console Output**:
1. Open Cursor's Integrated Terminal (Ctrl+`)
2. Console logs from Next.js server appear here
3. Look for "AuthProvider" messages

**View Browser Console**:
1. Open app in browser
2. Press F12 → Console tab
3. Filter for "AuthProvider" to see auth logs

**Common Debug Commands**:
```bash
# Check if Supabase credentials are set
echo $NEXT_PUBLIC_SUPABASE_URL

# Check if types are generated
ls types/supabase.ts

# Rebuild on file change
npm run dev -- --turbo  # For faster rebuilds
```

### Hot Reloading

Cursor automatically hot-reloads on file changes:
1. Edit a file in Cursor
2. Save (Ctrl+S)
3. Changes appear instantly in browser (in most cases)

---

## Vercel Deployment

### Prerequisites

- GitHub account with repository
- Vercel account (https://vercel.com)
- Production Supabase project (separate from dev)

### Step 1: Prepare Repository

Ensure your code is clean and committed:

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Fix auth flows and prepare for deployment"

# Push to GitHub
git push origin main
```

### Step 2: Create Vercel Project

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repo URL: `https://github.com/your-username/nook-app`
5. Click **"Import"**

**Option B: Via CLI**

```bash
npm install -g vercel
vercel login
vercel
```

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Select your project
2. Go to **Settings → Environment Variables**
3. Add all required variables:

```
NEXT_PUBLIC_SUPABASE_URL = "https://your-prod-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGc..."
NEXT_PUBLIC_APP_URL = "https://nook-app.vercel.app"
AUTH_SECRET = "random-secret-from-openssl"
JWT_SECRET = "random-secret"
SESSION_SECRET = "random-secret"
ENCRYPTION_KEY = "random-secret"
```

**Generate secure secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Set for which environments**:
- ✅ Production
- ✅ Preview
- ✅ Development (optional)

### Step 4: Configure Build Settings

In Vercel Dashboard → Settings → Build & Output:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 5: Deploy

**Option A: Automatic (Recommended)**
- Vercel automatically deploys on push to `main` branch
- Watch deployment progress in Vercel Dashboard → Deployments

**Option B: Manual Deploy**
```bash
vercel --prod
```

### Step 6: Verify Deployment

After deployment completes:

1. **Check Build Logs**:
   - Vercel Dashboard → Deployments → Latest
   - Look for ✅ signs (no ❌ errors)

2. **Visit Your App**:
   - Go to `https://nook-app.vercel.app` (or your custom domain)

3. **Test Sign-Up Flow**:
   - Click Sign Up
   - Create test account
   - Verify email
   - Log in
   - Check redirect to correct dashboard

4. **Monitor Errors**:
   - Vercel Dashboard → Function Logs
   - Look for errors in the past 1 hour

---

## Environment Variables

### Required Variables

These MUST be set for the app to work:

| Variable | Example | Source |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) or `https://nook-app.vercel.app` (prod) | Your deployment URL |

### Optional Variables

These enable additional features:

| Variable | Feature | Default |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe payments | Disabled |
| `SENDGRID_API_KEY` | Email notifications | Disabled |
| `SENTRY_DSN` | Error tracking | Disabled |

### Secrets Generation

```bash
# Generate random secrets for production
node -e "
for (let i = 0; i < 3; i++) {
  console.log(require('crypto').randomBytes(32).toString('hex'));
}
"

# Output:
# abc123...  (use for AUTH_SECRET)
# def456...  (use for JWT_SECRET)
# ghi789...  (use for SESSION_SECRET)
```

### Different for Dev vs Prod

Create separate Supabase projects:

**Development** (localhost:3000):
```
NEXT_PUBLIC_SUPABASE_URL = https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = dev-anon-key
```

**Production** (vercel):
```
NEXT_PUBLIC_SUPABASE_URL = https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = prod-anon-key
```

---

## Troubleshooting

### Issue: Build Fails with "Cannot find module"

**Error message**: `Error: Cannot find module '@supabase/supabase-js'`

**Solution**:
1. Check `package.json` has `@supabase/supabase-js` in dependencies
2. Run `npm install` locally to verify
3. Commit `package-lock.json` to git
4. Push to GitHub and redeploy

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not set"

**Error message**: `Error: NEXT_PUBLIC_SUPABASE_URL is not defined`

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Verify variable name is exactly `NEXT_PUBLIC_SUPABASE_URL`
3. Paste the full URL (e.g., `https://xyz.supabase.co`)
4. Wait 1-2 minutes for cache to clear
5. Redeploy

### Issue: "Sign-up fails with 403 Forbidden"

**Error message**: In browser console: `PGRST116` or `403 Forbidden`

**Solution** (in order):
1. Check `public.users` table exists in Supabase
2. Check RLS policies on `users` table (should allow inserts)
3. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
4. Check Supabase project is not paused

### Issue: "Cannot reach Supabase from Vercel"

**Error message**: `Connection timeout` or `ECONNREFUSED`

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is publicly accessible (should be)
2. Check Supabase project is running (not paused)
3. Check Supabase project region is correct
4. Verify no firewall blocking Supabase (unlikely)

### Issue: "Vercel Preview Not Working"

**When deploying pull requests**:
1. Check all environment variables are set for "Preview" environment too
2. Go to Vercel → Settings → Environment Variables
3. Enable each variable for **Preview** environment (checkbox)
4. Rebuild preview deployment

### Issue: "Redirect Loop on Login"

**Symptom**: After login, redirected back to `/login` repeatedly

**Cause**: Role not found in database or auth state mismatch

**Solution**:
1. Check user exists in `public.users` table
2. Verify user has a `role` (not NULL)
3. Check AuthProvider logs in browser console
4. Clear browser cookies: Settings → Privacy → Clear cache
5. Try fresh login

### Issue: "Function Cold Start Slow"

**Symptom**: First visit to app after deploy is slow (10+ seconds)

**Cause**: Vercel serverless functions initializing

**Solution**:
1. This is normal for cold starts
2. Add cron job to keep functions warm
3. Upgrade Vercel plan for faster cold starts
4. Or pre-warm with scheduled function

```typescript
// pages/api/warm.ts - Call this on schedule
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ status: 'warm' });
}
```

### Issue: "Type Errors on Deploy"

**Error message**: `Type error: Property 'X' does not exist`

**Solution**:
1. Run `npm run build` locally to catch errors
2. Fix TypeScript errors
3. Regenerate Supabase types if schema changed:
   ```bash
   npm run db:types  # If configured
   ```
4. Commit and push

---

## Rollback

If a deployment breaks production:

**Via Vercel Dashboard**:
1. Go to Deployments
2. Find the previous working deployment
3. Click the three dots (...) → **Promote to Production**

**Via CLI**:
```bash
vercel rollback
```

---

## Performance Tips

### Optimize for Vercel

```javascript
// next.config.js
const config = {
  // Enable SWR (Stale While Revalidate)
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Monitor Performance

**Vercel Analytics**:
1. Vercel Dashboard → Your Project → Analytics
2. Monitor Core Web Vitals
3. View slowest pages

---

## Next Steps

1. **Post-Deployment Checks**:
   - ✅ Homepage loads
   - ✅ Sign-up works
   - ✅ Email verification works
   - ✅ Login redirects to dashboard
   - ✅ Role-specific features visible

2. **Invite Beta Users**:
   - Share Vercel URL
   - Get feedback on flows

3. **Monitor & Debug**:
   - Watch Vercel Logs
   - Track Sentry errors (if configured)

---

**Documentation Accurate As Of**: January 26, 2026
