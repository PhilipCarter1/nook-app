# 🎯 GET THE APP FULLY WORKING - Complete Guide

**Created**: January 27, 2026  
**Objective**: Full step-by-step path to get Nook working end-to-end  
**Prerequisites**: You have database backup + storage backup files

---

## ⚡ QUICK START (30 mins)

If you just want to get it running locally:

```bash
# 1. Install dependencies
npm install

# 2. Set up database (see below)
# → Follow "PHASE 1: Database Restoration" section

# 3. Configure environment
cp .env.example .env.local
# → Add Supabase credentials to .env.local

# 4. Start dev server
npm run dev

# 5. Visit http://localhost:3000
```

---

## 📋 THE COMPLETE PATH (Step-by-Step)

This guide walks you through **5 phases** to get the app fully working, from database restoration through local testing and deployment.

### Phase Overview

```
PHASE 1: Database Restoration    (15 mins)
    ↓
PHASE 2: Local Environment Setup (20 mins)
    ↓
PHASE 3: Local Testing           (30 mins)
    ↓
PHASE 4: Fix Any Issues          (variable)
    ↓
PHASE 5: Deploy & Monitor        (20 mins)
```

---

## PHASE 1: DATABASE RESTORATION (15 minutes)

### ⚠️ Important: About Your Supabase Status

You mentioned:
- ✅ Supabase was paused
- ✅ You downloaded database backup
- ✅ You downloaded storage backup/objects

**What this means**:
- Your old Supabase project was paused (no data loss)
- You have the data saved locally
- We need to create a NEW Supabase project and restore your data

### Step 1.1: Create New Supabase Project

1. Go to https://supabase.com and log in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `nook-app` (or any name)
   - **Password**: Create strong password, save it
   - **Region**: `us-east-1` (or closest to you)
   - **Plan**: Free tier is fine for development
4. Click **"Create New Project"** and wait 2-3 minutes

### Step 1.2: Get Your Credentials

In your new Supabase project:

1. Go to **Settings → API** (left sidebar)
2. Copy these three values and save them:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   ```
3. You'll need these in 10 minutes

### Step 1.3: Restore Your Database Backup

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. You have two options:

**Option A: Upload SQL File** (Recommended)
- Click the upload icon
- Select your database backup SQL file
- Click **"Execute"**
- Wait for completion ✅

**Option B: Paste SQL** (if upload fails)
- Open your backup file in a text editor
- Copy all content
- Paste into the SQL Editor
- Click **"Execute"**

### Step 1.4: Verify Database Restored

1. Go to **Table Editor** (left sidebar)
2. You should see these tables (click to expand):
   - ✅ `users`
   - ✅ `organizations`
   - ✅ `properties`
   - ✅ `units`
   - ✅ `leases`
   - ✅ `tenants`
   - ✅ `maintenance_tickets`
   - ✅ `documents`
   - ✅ `payments`
   - And others...

If you see these tables with data, **Phase 1 is complete!** ✅

### Step 1.5: Restore Storage Buckets (Optional but Recommended)

If you have files/documents to restore:

1. In Supabase, go to **Storage** (left sidebar)
2. Create these buckets (if they don't exist):
   - `documents` (tenant documents)
   - `avatars` (user profile pictures)
   - `property-images` (property photos)
3. Upload your backed-up files to each bucket

---

## PHASE 2: LOCAL ENVIRONMENT SETUP (20 minutes)

### Step 2.1: Clone/Open Project

```bash
# Navigate to your project folder
cd /path/to/nook-app
```

### Step 2.2: Install Dependencies

```bash
npm install
# This takes 2-3 minutes
```

### Step 2.3: Create `.env.local` File

```bash
cp .env.example .env.local
```

### Step 2.4: Add Your Supabase Credentials

Open `.env.local` and find these lines:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Replace with values from Step 1.2:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2.5: Verify Other Important Variables

Make sure these are also set:

```env
# Database (optional, for migrations)
DATABASE_URL=postgresql://...

# Optional but recommended:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

If these are missing, the app will work but payment/stripe features won't.

---

## PHASE 3: LOCAL TESTING (30 minutes)

### Step 3.1: Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
- Local: http://localhost:3000
```

### Step 3.2: Open the App

Open browser to: **http://localhost:3000**

You should see the Nook landing page. ✅

### Step 3.3: Test Sign-Up (Tenant)

1. Click **"Sign Up"** link
2. Fill in form:
   - Email: `test-tenant@example.com`
   - Password: `Test123!@#` (must be strong)
   - Confirm Password: `Test123!@#`
   - First Name: Test
   - Last Name: Tenant
   - Role: **Tenant**
3. Click **"Sign Up"** button
4. You should see: "Check your email to verify your account"

### Step 3.4: Verify Email

1. In your email (or spam folder), look for Supabase verification email
2. Click the verification link
3. You should be redirected to login page ✅

**Note**: If you don't see email, check:
- [ ] Spam folder
- [ ] Supabase has email sending enabled
- [ ] Check Supabase logs: Authentication → Email logs

### Step 3.5: Test Login

1. Go back to http://localhost:3000
2. Click **"Log In"** link
3. Enter: `test-tenant@example.com` / `Test123!@#`
4. Click **"Log In"**
5. You should be redirected to **`/dashboard/tenant`** ✅

### Step 3.6: Check Dashboard

If you see a tenant dashboard page, you're good! ✅

If you see errors:
- [ ] Open Developer Console: Press `F12`
- [ ] Look for error messages in Console tab
- [ ] See **PHASE 4** below for fixes

### Step 3.7: Test Sign-Up (Landlord)

Repeat steps 3.3-3.5 but:
- Use email: `test-landlord@example.com`
- Choose role: **Landlord**
- Verify redirect to **`/dashboard/landlord`** instead of tenant ✅

### Step 3.8: Check Console for Errors

1. Press `F12` in browser
2. Click **"Console"** tab
3. Look for:
   - ✅ Green messages (should say "AuthProvider loaded", etc.)
   - ❌ Red errors (would indicate problems)

If you see ❌ red errors, note them for Phase 4.

---

## PHASE 4: FIX ANY ISSUES

### Common Issues & Solutions

#### Issue 1: "Error: Failed to fetch user profile"
**Cause**: User created in auth but not in `public.users` table  
**Fix**:
1. Go to Supabase Dashboard
2. Table Editor → `public.users`
3. Check if your test user is there
4. If not, add manually (create row with user's id, email, role)

#### Issue 2: "Wrong Dashboard After Login"
**Cause**: User role not set correctly  
**Fix**:
1. Supabase → Table Editor → `users`
2. Find your test user
3. Check `role` column is set to `tenant` or `landlord`
4. If wrong, edit it

#### Issue 3: "Email Verification Not Working"
**Cause**: Supabase email not configured  
**Fix**:
1. Supabase Dashboard → Authentication
2. Click **"Email"** provider
3. Check if email sending is enabled
4. For development, use test email or check Supabase logs

#### Issue 4: "npm run build Fails with Errors"
**Cause**: TypeScript or linting errors  
**Fix**:
```bash
# Check what's wrong
npm run build

# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint
```

#### Issue 5: "Blank Dashboard or Missing Data"
**Cause**: Features not fully implemented  
**Expected**: See REQUIREMENTS_TRACKER.md for what's completed vs not  
**Status**: Dashboard structure exists but content incomplete (48% done)

---

## PHASE 5: DEPLOY & MONITOR

### Step 5.1: Build Locally (Verify)

```bash
npm run build
```

Should complete without errors. ✅

### Step 5.2: Deploy to Vercel (Optional but Recommended)

#### A. Connect GitHub to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to https://vercel.com
3. Click **"New Project"**
4. Connect your GitHub account
5. Select your `nook-app` repository
6. Click **"Import"**

#### B. Add Environment Variables

In Vercel dashboard:

1. Click on your project
2. Go to **Settings → Environment Variables**
3. Add these (copy from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Click **"Deploy"**

#### C. Test Production Deployment

1. Wait for Vercel to deploy (2-5 minutes)
2. You'll get a URL like: `https://nook-app-abc123.vercel.app`
3. Test it the same way you tested locally:
   - Sign up
   - Verify email
   - Login
   - Check dashboard

---

## 🎯 WHAT'S NEXT?

Now that you have the app running, you can:

### Option A: Work on New Features
See **REQUIREMENTS_TRACKER.md** for what's not yet implemented and what to build next.

See **ACTION_PLAN.md** for a phased 8-week development roadmap.

### Option B: Fix Known Issues
See section **"PHASE 4: Fix Any Issues"** above.

### Option C: Set Up Proper Database
If you want production-ready setup:
- Upgrade Supabase to Pro tier (for backups, performance)
- Set up automated backups
- Configure RLS policies (currently disabled for development)
- Set up monitoring

---

## 📚 REFERENCE GUIDES

If you need more details:

- **Database Questions**: See `guide/01_supabase_restoration.md`
- **Local Setup Details**: See `guide/02_setup_instructions.md`
- **Technical Details**: See `guide/03_developer_notes.md`
- **Deployment Details**: See `guide/04_deploy_vercel_cursor.md`
- **Testing**: See `guide/05_run_tests.md`
- **Feature Status**: See `REQUIREMENTS_TRACKER.md`
- **Development Plan**: See `ACTION_PLAN.md`

---

## ✅ SUCCESS CHECKLIST

You've succeeded when:

- [ ] Database restored in new Supabase project
- [ ] `.env.local` configured with Supabase credentials
- [ ] `npm run dev` starts without errors
- [ ] App loads at http://localhost:3000
- [ ] Can sign up as tenant
- [ ] Can verify email
- [ ] Can login and see tenant dashboard
- [ ] Can sign up as landlord
- [ ] Can login and see landlord dashboard
- [ ] No red ❌ errors in browser console
- [ ] `npm run build` completes successfully

---

## 🆘 IF YOU GET STUCK

1. **Check the relevant guide file**:
   - Database issues → `guide/01_supabase_restoration.md`
   - Setup issues → `guide/02_setup_instructions.md`
   - Technical issues → `guide/03_developer_notes.md`

2. **Check current requirements status**:
   - See `REQUIREMENTS_TRACKER.md` Section J (UI/UX) for stability notes
   - See `REQUIREMENTS_TRACKER.md` Section I (Security) - Note: RLS is currently disabled

3. **Common locations to check**:
   - Browser DevTools: `F12` → Console tab (look for errors)
   - Supabase Dashboard: Check tables, auth logs
   - `.env.local`: Verify all credentials are correct

4. **Ask yourself**:
   - Is Supabase project created and running?
   - Are all credentials in `.env.local` correct?
   - Is the database backup imported successfully?
   - Are there errors in the browser console?

---

## 💡 Pro Tips

1. **Keep this open**: Reference this guide while setting up
2. **Don't skip steps**: Each step builds on the previous one
3. **Test as you go**: Don't wait until the end to test
4. **Save credentials**: Keep `.env.local` credentials safe
5. **Check console errors**: Browser console (`F12`) is your friend

---

**You've got this! Follow the phases in order and you'll have the app working.** ✨

Let me know when you get stuck and I'll help troubleshoot! 🚀
