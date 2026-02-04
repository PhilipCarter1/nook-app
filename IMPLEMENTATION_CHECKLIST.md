# ✅ IMPLEMENTATION CHECKLIST - Use This While Fixing

**Purpose**: Track progress as you fix each issue  
**Status**: Mark ✅ when done, 🔄 when in progress, ⏳ when blocked  
**Review**: Check off each item, document blockers, update daily  

---

## 📋 PHASE 1: CRITICAL SECURITY FIXES (19 hours)

### ISSUE #1: FIX EMAIL SYSTEM (4 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Research (30 min)**
  - [ ] Review CRITICAL_ISSUES_ACTION_PLAN.md Issue #1
  - [ ] Choose email provider (SendGrid or Resend)
  - [ ] Create account if needed

- [ ] **Setup (30 min)**
  - [ ] Get API key from SendGrid or Resend
  - [ ] Install package: `npm install @sendgrid/mail` OR `npm install resend`
  - [ ] Update .env.local with API key
  - [ ] Do NOT commit .env.local to git

- [ ] **Implement (1 hour)**
  - [ ] Update `lib/services/email.ts` main function
  - [ ] Update `sendWelcomeEmail()`
  - [ ] Update `sendPasswordResetEmail()`
  - [ ] Update `sendInvitationEmail()`
  - [ ] Update `sendMaintenanceRequestEmail()`
  - [ ] Update `sendPaymentReminderEmail()`
  - [ ] Update `sendLeaseExpirationEmail()`
  - [ ] Update `sendTenantInvitation()`
  - [ ] Update `sendDocumentApprovalNotification()`
  - [ ] Remove all TODO comments
  - [ ] Add proper error handling

- [ ] **Test (1 hour)**
  - [ ] Create test endpoint at `/api/test-email`
  - [ ] Test each email function individually
  - [ ] Verify email arrives in inbox
  - [ ] Check email formatting (HTML rendering)
  - [ ] Test with multiple email addresses
  - [ ] Test error handling (bad email, api key)

- [ ] **Deploy**
  - [ ] Run `npm run build` - should pass
  - [ ] Commit: `git add . && git commit -m "fix: implement email system"`
  - [ ] Push: `git push`
  - [ ] Wait for Vercel deployment (3-5 min)
  - [ ] Test in production: POST /api/test-email

- [ ] **Verification Checklist**
  - [ ] Email arrives within 10 seconds
  - [ ] No "Undefined API key" errors
  - [ ] Logs show successful send
  - [ ] npm run build passes
  - [ ] No TypeScript errors
  - [ ] No console errors

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #2: FIX RLS SECURITY (8 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Enable RLS on All Tables (30 min)**
  - [ ] Open Supabase → SQL Editor
  - [ ] Run: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE properties ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE units ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE payments ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE comments ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE leases ENABLE ROW LEVEL SECURITY;`
  - [ ] Run: `ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;`
  - [ ] Verify all tables show `rowsecurity = true`

- [ ] **Create RLS Policies for Users (1 hour)**
  - [ ] Policy: Users view own profile only
  - [ ] Policy: Admins view all users
  - [ ] Policy: Users update own profile
  - [ ] Test: User can see own profile
  - [ ] Test: User cannot see other profiles
  - [ ] Test: Admin can see all profiles

- [ ] **Create RLS Policies for Properties (1 hour)**
  - [ ] Policy: Landlords view own properties
  - [ ] Policy: Tenants view assigned properties
  - [ ] Policy: Admins view all properties
  - [ ] Test: Landlord sees only own properties
  - [ ] Test: Tenant sees only assigned properties
  - [ ] Test: Admin sees all properties

- [ ] **Create RLS Policies for Payments (1 hour)**
  - [ ] Policy: Users view own payments
  - [ ] Policy: Admins view all payments
  - [ ] Test: User sees only own payments
  - [ ] Test: Admin sees all payments
  - [ ] Test: Tenant can't see other tenant payments

- [ ] **Create RLS Policies for Documents (1 hour)**
  - [ ] Policy: Users view accessible documents
  - [ ] Policy: Admins view all documents
  - [ ] Test: User sees only accessible documents
  - [ ] Test: Admin sees all documents

- [ ] **Create RLS Policies for Maintenance (1 hour)**
  - [ ] Policy: Users view assigned tickets
  - [ ] Policy: Admins view all tickets
  - [ ] Test: User sees only their tickets
  - [ ] Test: Admin sees all tickets

- [ ] **Test All Policies (2 hours)**
  - [ ] Test as tenant (multiple users)
  - [ ] Test as landlord (multiple users)
  - [ ] Test as admin (cross-property)
  - [ ] No "PGRST116" errors
  - [ ] No "PGRST119" errors
  - [ ] All data access works as expected
  - [ ] Update database if issues found

- [ ] **Deploy & Verify**
  - [ ] Backup database (Supabase auto-backs up)
  - [ ] Commit RLS policies (document as migration)
  - [ ] Test in staging environment
  - [ ] Test in production
  - [ ] Monitor logs for errors (24 hours)

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #3: CONSOLIDATE AUTH SYSTEM (6 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Remove NextAuth (1 hour)**
  - [ ] Run: `npm uninstall next-auth @next-auth/providers bcryptjs`
  - [ ] Delete: `lib/auth-options.ts`
  - [ ] Delete: `pages/api/auth/[...nextauth].ts` (if exists)
  - [ ] Remove NextAuth imports from all files
  - [ ] Verify no NextAuth references remain

- [ ] **Update lib/auth.ts (1 hour)**
  - [ ] Implement `getCurrentUser()`
  - [ ] Implement `login(email, password)`
  - [ ] Implement `logout()`
  - [ ] Implement `signup(email, password, metadata)`
  - [ ] Add proper error handling
  - [ ] Add logging

- [ ] **Update Middleware (1 hour)**
  - [ ] Switch from NextAuth to Supabase auth
  - [ ] Update protected route checks
  - [ ] Update redirect logic
  - [ ] Test middleware on protected routes

- [ ] **Update Login Components (2 hours)**
  - [ ] Update all login pages (find with grep)
  - [ ] Update signup forms
  - [ ] Update logout buttons
  - [ ] Replace signIn() with login()
  - [ ] Replace signOut() with logout()
  - [ ] Test all auth flows

- [ ] **Test & Verify**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Session persists across refreshes
  - [ ] Protected routes redirect to login
  - [ ] Public routes accessible
  - [ ] No duplicate sessions
  - [ ] No console errors

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #4: CONFIGURE PRODUCTION KEYS (1 hour)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Get Stripe Production Keys (10 min)**
  - [ ] Go to: https://dashboard.stripe.com/apikeys
  - [ ] Toggle: "Live data" (top right)
  - [ ] Copy: Secret key (sk_live_...)
  - [ ] Copy: Publishable key (pk_live_...)
  - [ ] Store securely (Password manager)

- [ ] **Get Stripe Webhook Secret (10 min)**
  - [ ] Go to: https://dashboard.stripe.com/webhooks
  - [ ] Add endpoint: https://yourdomain.com/api/stripe/webhook
  - [ ] Select events: payment_intent.*, invoice.*
  - [ ] Copy: Signing secret (whsec_...)
  - [ ] Store securely

- [ ] **Get Email API Key (5 min)**
  - [ ] SendGrid: https://app.sendgrid.com/settings/api_keys
  - [ ] Copy: API key (SG_...)
  - [ ] OR Resend: https://resend.com/api-keys
  - [ ] Copy: API key (re_...)
  - [ ] Store securely

- [ ] **Configure in Vercel Dashboard (20 min)**
  - [ ] Go to: Vercel.com → Your Project
  - [ ] Navigate to: Settings → Environment Variables
  - [ ] Add: STRIPE_SECRET_KEY = sk_live_...
  - [ ] Add: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
  - [ ] Add: STRIPE_WEBHOOK_SECRET = whsec_...
  - [ ] Add: SENDGRID_API_KEY = SG_...
  - [ ] Save all variables
  - [ ] Trigger redeploy (or manual redeploy)

- [ ] **Verify Configuration**
  - [ ] Check Vercel shows variables (masked)
  - [ ] Build succeeds with new env vars
  - [ ] Stripe test payment works (test mode first)
  - [ ] Webhook test successful
  - [ ] Email sending works

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

## 📋 PHASE 2: CODE CLEANUP (8 hours)

### ISSUE #5A: REMOVE CONSOLE.LOGS (2 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Find all console statements (15 min)**
  - [ ] Run: `grep -r "console\." --include="*.ts" --include="*.tsx" app/ lib/ components/`
  - [ ] Count total occurrences
  - [ ] Document list of files

- [ ] **Replace with logger (1 hour 45 min)**
  - [ ] For each file with console statements:
    - [ ] Add import: `import { log } from '@/lib/logger';`
    - [ ] Replace: `console.log()` → `log.info()`
    - [ ] Replace: `console.error()` → `log.error()`
    - [ ] Replace: `console.warn()` → `log.warn()`
    - [ ] Replace: `console.debug()` → `log.debug()`
  - [ ] Verify no console statements remain
  - [ ] Run `npm run build` - should pass

- [ ] **Verify**
  - [ ] Build passes
  - [ ] No TypeScript errors
  - [ ] Browser console clean
  - [ ] Logs still appear in development

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #5B: REPLACE ANY TYPES (3 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Find all any types (15 min)**
  - [ ] Run: `grep -r ": any" --include="*.ts" --include="*.tsx" app/ lib/ components/`
  - [ ] Count total occurrences
  - [ ] Document list of files

- [ ] **Replace with proper types (2 hours 45 min)**
  - [ ] For each file with `any`:
    - [ ] Identify what type should be used
    - [ ] Create interface if needed
    - [ ] Replace `any` with proper type
    - [ ] Fix TypeScript errors if any
  - [ ] Run `npm run build` - should pass

- [ ] **Verify**
  - [ ] Build passes
  - [ ] No TypeScript errors
  - [ ] All types are specific

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #5C: REPLACE MOCK IMPLEMENTATIONS (3 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Find all mocks (15 min)**
  - [ ] Run: `grep -r "mock\|Mock\|MOCK" --include="*.ts" --include="*.tsx" lib/services/`
  - [ ] Document all mock functions

- [ ] **Replace each mock (2 hours 45 min)**
  - [ ] `lib/services/usage.ts` - checkUsageLimits()
  - [ ] `lib/services/usage.ts` - getActiveAlerts()
  - [ ] `lib/services/usage.ts` - getUsageAlerts()
  - [ ] `lib/services/usage.ts` - dismissAlert()
  - [ ] `lib/services/email.ts` - All functions updated (already done in Phase 1)
  - [ ] `lib/services/maintenance.ts` - All functions
  - [ ] Other mocks as found
  - [ ] Each should query real database, not return hardcoded data

- [ ] **Verify**
  - [ ] Build passes
  - [ ] No TypeScript errors
  - [ ] Functions use real data

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

## 📋 PHASE 3: TESTING (20+ hours)

### ISSUE #5D: UNIT TESTS (10 hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Setup Testing (30 min)**
  - [ ] Verify vitest installed: `npm list vitest`
  - [ ] Run: `npm run test:unit:watch`
  - [ ] Verify tests run without errors

- [ ] **Auth Tests (2 hours)**
  - [ ] Test: login() function
  - [ ] Test: logout() function
  - [ ] Test: signup() function
  - [ ] Test: getCurrentUser() function
  - [ ] Test: RLS policies work correctly
  - [ ] Aim for 100% coverage

- [ ] **Payment Tests (2 hours)**
  - [ ] Test: createPaymentIntent()
  - [ ] Test: handleStripeWebhook()
  - [ ] Test: confirmPayment()
  - [ ] Test: updatePaymentStatus()
  - [ ] Aim for 100% coverage

- [ ] **Email Tests (2 hours)**
  - [ ] Test: sendEmail()
  - [ ] Test: sendWelcomeEmail()
  - [ ] Test: sendPasswordResetEmail()
  - [ ] Test: sendInvitationEmail()
  - [ ] Test: All other email functions
  - [ ] Aim for 100% coverage

- [ ] **Utility Tests (2 hours)**
  - [ ] Test: formatters
  - [ ] Test: validators
  - [ ] Test: parsers
  - [ ] Test: helpers
  - [ ] Aim for 90%+ coverage

- [ ] **Coverage Target (1 hour)**
  - [ ] Run: `npm run test:unit:watch -- --coverage`
  - [ ] Target: 80%+ overall coverage
  - [ ] Check: All critical paths covered
  - [ ] Document: Coverage report

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

### ISSUE #5E: E2E TESTS (10+ hours)

**Start Date**: _________  
**Expected End**: _________  
**Actual End**: _________  

- [ ] **Fix Existing E2E Tests (2 hours)**
  - [ ] Run: `npm run test:e2e:comprehensive`
  - [ ] Document failed tests
  - [ ] Fix each failure
  - [ ] Verify tests pass

- [ ] **User Registration Flow (2 hours)**
  - [ ] Test: Signup form renders
  - [ ] Test: Validation works
  - [ ] Test: Email verification
  - [ ] Test: Account created in database
  - [ ] Test: Email sent to user

- [ ] **User Login Flow (1 hour)**
  - [ ] Test: Login form renders
  - [ ] Test: Valid credentials work
  - [ ] Test: Invalid credentials fail
  - [ ] Test: Session created
  - [ ] Test: Redirect to dashboard

- [ ] **Landlord Workflow (2 hours)**
  - [ ] Test: Create property
  - [ ] Test: Add units
  - [ ] Test: Invite tenants
  - [ ] Test: View payments
  - [ ] Test: Upload documents

- [ ] **Tenant Workflow (2 hours)**
  - [ ] Test: Accept invitation
  - [ ] Test: View lease
  - [ ] Test: Make payment
  - [ ] Test: Upload documents
  - [ ] Test: View maintenance tickets

- [ ] **Payment Processing (1 hour)**
  - [ ] Test: Create payment intent
  - [ ] Test: Stripe webhook
  - [ ] Test: Payment status updated
  - [ ] Test: Receipt sent

**Status**: ⏳ Not Started | 🔄 In Progress | ✅ Complete

**Blockers**: _________________________________________________

**Notes**: __________________________________________________

---

## 📋 FINAL VERIFICATION

### Pre-Launch Checklist (Before Production)

- [ ] **Code Quality**
  - [ ] `npm run build` passes
  - [ ] `npm run lint` passes
  - [ ] No TypeScript errors
  - [ ] No console errors
  - [ ] No console.logs in production code

- [ ] **Security**
  - [ ] RLS enabled on all tables ✅
  - [ ] RLS policies tested ✅
  - [ ] Auth system consolidated ✅
  - [ ] CORS restricted to domain
  - [ ] No hardcoded secrets in code
  - [ ] .env.local in .gitignore

- [ ] **Configuration**
  - [ ] Production Stripe keys set ✅
  - [ ] Webhook secret configured ✅
  - [ ] Email API key configured ✅
  - [ ] All env vars in Vercel dashboard
  - [ ] All env vars NOT in git

- [ ] **Testing**
  - [ ] 80%+ unit test coverage ✅
  - [ ] Critical E2E tests pass ✅
  - [ ] No flaky tests
  - [ ] Load test completed
  - [ ] Security test completed

- [ ] **Deployment Readiness**
  - [ ] Rollback plan documented
  - [ ] Incident response plan ready
  - [ ] Emergency contacts listed
  - [ ] Monitoring configured (Sentry)
  - [ ] Backup strategy in place

- [ ] **Team Sign-off**
  - [ ] Dev team: ✅ Code reviewed
  - [ ] QA team: ✅ Tests passed
  - [ ] DevOps: ✅ Deployment ready
  - [ ] Security: ✅ Audit passed
  - [ ] Product: ✅ Business ready

---

## 📊 PROGRESS TRACKING

**Overall Progress**: ████░░░░░░ 40%

| Phase | Task | Status | Hours | Deadline |
|-------|------|--------|-------|----------|
| 1 | Email System | ⏳ | 4 | Day 1 |
| 1 | RLS Security | ⏳ | 8 | Day 2 |
| 1 | Auth System | ⏳ | 6 | Day 2 |
| 1 | Prod Keys | ⏳ | 1 | Day 3 |
| 2 | Code Cleanup | ⏳ | 8 | Day 3-4 |
| 3 | Unit Tests | ⏳ | 10 | Day 5-6 |
| 3 | E2E Tests | ⏳ | 10 | Day 6-7 |
| **TOTAL** | | | **47** | **Week 1** |

---

## 🎯 DAILY STANDUP TEMPLATE

**Date**: _________

**What I Did Yesterday**:
- [ ] Item 1
- [ ] Item 2

**What I'm Doing Today**:
- [ ] Item 1
- [ ] Item 2

**Blockers**:
- [ ] None
- [ ] Item 1: Description

**Confidence Level**: 🟢 Good | 🟡 Okay | 🔴 Low

**Next Update**: _________

---

**Print this page** and keep it at your desk while fixing issues.  
**Update daily** to track progress.  
**Share in standups** to keep team aligned.

Let's ship it! 🚀
