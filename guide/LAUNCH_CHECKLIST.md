# Pre-Launch Verification Checklist

This checklist ensures Nook is ready for customer use.

---

## Your Pre-Launch Steps (What You Need to Do)

### ✅ Phase 1: Database Setup (15 minutes)

- [ ] Create new Supabase project at https://supabase.com
- [ ] Import your SQL database backup (guide/01_supabase_restoration.md)
- [ ] Create storage buckets (documents, avatars, property-images, maintenance-uploads)
- [ ] Upload storage files from your backup
- [ ] Copy Supabase credentials:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY

### ✅ Phase 2: Local Testing (30 minutes)

- [ ] Copy `.env.example` to `.env.local`
- [ ] Paste Supabase credentials into `.env.local`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000 in browser
- [ ] **Sign-up as Tenant**:
  - [ ] Fill signup form
  - [ ] Submit
  - [ ] Check email for verification link
  - [ ] Verify email
  - [ ] Log in with credentials
  - [ ] Verify redirected to `/dashboard/tenant`
- [ ] **Sign-up as Landlord**:
  - [ ] Repeat signup process
  - [ ] Verify redirected to `/dashboard/landlord`
- [ ] Check browser console (F12) for errors:
  - [ ] No red ❌ errors
  - [ ] Green ✅ logs appear for successful auth

### ✅ Phase 3: Build Verification (10 minutes)

- [ ] Run `npm run build`
  - [ ] Build completes without errors
  - [ ] No TypeScript errors
- [ ] Run `npm run lint`
  - [ ] No critical lint errors

### ✅ Phase 4: Vercel Deployment (20 minutes)

- [ ] Create Vercel account at https://vercel.com
- [ ] Connect GitHub repository to Vercel
- [ ] Add environment variables in Vercel dashboard:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] (Generate new secrets for AUTH_SECRET, JWT_SECRET, etc.)
- [ ] Wait for deployment to complete
- [ ] Visit your Vercel URL (e.g., https://nook-app.vercel.app)
- [ ] Test the same signup/login flows as local
  - [ ] Sign-up works
  - [ ] Email verification works (check Supabase)
  - [ ] Login redirects to correct dashboard
  - [ ] Check browser console (F12) for errors

### ✅ Phase 5: Feature Testing (30 minutes per role)

For each role (Tenant, Landlord, Admin):

**Tenant**:
- [ ] Log in as tenant
- [ ] Can see `/dashboard/tenant`
- [ ] Can see lease information (if available)
- [ ] Can view payment section
- [ ] Can access document upload

**Landlord**:
- [ ] Log in as landlord
- [ ] Can see `/dashboard/landlord`
- [ ] Can see properties list
- [ ] Can see pending documents to approve
- [ ] Can view tenant information

**Admin**:
- [ ] Log in as admin
- [ ] Can see `/admin/dashboard`
- [ ] Can see user management section
- [ ] Can access system settings

---

## Critical Checks

### 🔴 MUST PASS - Auth Flow

```bash
✅ Sign-up creates account in auth
✅ User profile created in public.users table
✅ Email verification works
✅ Login fetches user profile
✅ Role is assigned correctly
✅ Correct dashboard shown for each role
✅ Logout clears session
✅ No "PGRST116" errors in console
```

### 🔴 MUST PASS - Security

```bash
✅ HTTPS in production (Vercel provides)
✅ Supabase credentials are server-side only
✅ No hardcoded secrets in code
✅ RLS policies protect data access
✅ Public vs. Private storage buckets correct
```

### 🟡 SHOULD PASS - Performance

```bash
✅ Homepage loads in < 3 seconds
✅ Dashboard loads in < 2 seconds
✅ No console warnings (except React warnings)
✅ Build size is reasonable
```

---

## Post-Launch Monitoring

### Daily Checks (First Week)

- [ ] Check Vercel Deployment logs for errors
- [ ] Check Supabase dashboard for database health
- [ ] Check auth logs for failed logins
- [ ] Test signup/login manually once per day

### Weekly Checks

- [ ] Review error logs (Sentry if configured)
- [ ] Check database performance
- [ ] Monitor Vercel analytics
- [ ] Backup database regularly

### Monthly Checks

- [ ] Review storage usage (documents, images)
- [ ] Check for unused data/tables
- [ ] Plan for scaling if needed
- [ ] Update dependencies (`npm update`)

---

## What to Watch For

### 🔴 Critical Issues (Fix Immediately)

- [ ] Users can't sign up
- [ ] Signup succeeds but login fails
- [ ] Wrong dashboard shown after login
- [ ] 500 errors in Vercel logs
- [ ] Database connection errors

### 🟡 Warning Issues (Fix Soon)

- [ ] "PGRST116" or "406" errors in console
- [ ] RLS policy violations
- [ ] Slow page loads (> 5 seconds)
- [ ] Email not sending

### 🟢 Info Issues (Nice to Fix)

- [ ] Typos or UI issues
- [ ] Performance optimizations
- [ ] Analytics setup
- [ ] Error tracking (Sentry)

---

## Rollback Plan

If something breaks after going live:

1. **Immediate**: Revert to previous Vercel deployment
   ```
   Vercel Dashboard → Deployments → Click previous version → Promote to Production
   ```

2. **Database Issue**: Restore from Supabase backup
   ```
   Supabase Dashboard → Settings → Database → Backups → Restore
   ```

3. **Environment Variables**: Update in Vercel if credentials wrong
   ```
   Vercel Dashboard → Settings → Environment Variables → Edit and redeploy
   ```

---

## Common Troubleshooting

### Signup Fails
Check:
1. Supabase project is running (not paused)
2. `public.users` table exists with correct schema
3. RLS policies allow inserts
4. `SUPABASE_SERVICE_ROLE_KEY` is correct

### Login Redirects to Wrong Dashboard
Check:
1. User has correct `role` in `public.users` table
2. AuthProvider logs show correct role
3. Browser console shows no errors

### Email Not Sending
Check:
1. If using SendGrid: API key is set
2. Check spam folder
3. Verify email address is registered

### Build Fails on Vercel
Check:
1. Run `npm run build` locally
2. Fix TypeScript errors
3. Check for missing dependencies
4. Commit and push fixes

---

## Success Criteria

Your Nook MVP is ready for customers when:

- ✅ Users can sign up with any role
- ✅ Each role sees correct dashboard
- ✅ Core features work (at minimum: auth, dashboard, profile)
- ✅ No critical errors in console
- ✅ Supabase database is operational
- ✅ Vercel deployment is stable
- ✅ You've tested all major flows manually

---

## Support Resources

**Getting Stuck?**

1. Check relevant guide in `guide/` directory
2. Look at browser console (F12) for errors
3. Check Supabase logs and table data
4. Review Vercel deployment logs
5. Check GitHub issues or community forums

**Key Documents**:
- `guide/00_SUMMARY.md` - Overview of changes
- `guide/03_developer_notes.md` - Technical reference
- `guide/04_deploy_vercel_cursor.md` - Deployment help

---

## Final Checklist

Before inviting your first customer:

- [ ] Database is set up and populated with data
- [ ] App deployed to Vercel with live URL
- [ ] All environment variables configured
- [ ] Auth flow tested with multiple roles
- [ ] Each role sees correct features
- [ ] No errors in browser console
- [ ] Vercel deployment is green (no errors)
- [ ] Core features are working (at minimum)
- [ ] Documented any remaining issues/workarounds
- [ ] Team knows how to troubleshoot

---

## Celebration 🎉

Once all checks pass, you're ready to launch Nook to real customers!

**What's Next**:
1. Invite beta users
2. Gather feedback
3. Plan Phase 2 features
4. Monitor and scale

---

**Generated**: January 26, 2026  
**For**: Nook MVP Launch
