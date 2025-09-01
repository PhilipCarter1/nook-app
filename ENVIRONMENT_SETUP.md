# 🔧 Environment Setup Guide

## 🚨 **CRITICAL: Authentication Issues**

The login errors you're experiencing are due to **missing environment variables** in production. Here's how to fix it:

## 📋 **Required Environment Variables**

### 1. Supabase Configuration (REQUIRED for login)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Stripe Configuration (for payments)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Email Configuration
```bash
RESEND_API_KEY=your_resend_api_key
```

### 4. App Configuration
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Nook
NEXT_PUBLIC_APP_DESCRIPTION=Modern Property Management Platform
```

## 🚀 **How to Fix the Login Issue**

### Step 1: Get Your Supabase Credentials
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the following (IMPORTANT: These are DIFFERENT values):

   **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - Copy this EXACT URL → `NEXT_PUBLIC_SUPABASE_URL`

   **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - This is a LONG JWT token → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - This is a DIFFERENT long JWT token → `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **CRITICAL**: These three values should be COMPLETELY DIFFERENT from each other!

### Step 2: Add to Vercel
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your nook-app project
3. Go to Settings → Environment Variables
4. Add each variable (make sure they are DIFFERENT):

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://abcdefghijklmnop.supabase.co` (your actual project URL)
   - Environment: Production, Preview, Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual anon key)
   - Environment: Production, Preview, Development

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual service role key)
   - Environment: Production, Preview, Development

   ⚠️ **DOUBLE-CHECK**: Each value should be completely different!

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger redeployment

## 🔍 **Verification Steps**

### Check Environment Variables
1. Go to your deployed app
2. Open browser console (F12)
3. Type: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
4. Should show your Supabase URL (not undefined)

### Test Login
1. Try logging in with a test account
2. Check browser console for errors
3. Should see "Attempting to sign in with: [email]" in console

## 🆘 **If Still Having Issues**

### Check Supabase Project Status
1. Ensure your Supabase project is active
2. Check if you have users in the `auth.users` table
3. Verify RLS policies are properly configured

### Check Vercel Logs
1. Go to Vercel dashboard
2. Click on your latest deployment
3. Check the "Functions" tab for any errors
4. Look for environment variable errors

### Test Locally
1. Create a `.env.local` file in your project root
2. Add the environment variables
3. Run `npm run dev`
4. Test login locally first

## 📞 **Support**

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Check that test users exist in your database

The login should work once the environment variables are properly configured!
