# 🚨 CRITICAL ISSUES - QUICK REFERENCE & ACTION ITEMS

**Status**: 5 Blocking Issues Found  
**Time to Fix**: 21-30 hours minimum  
**Risk Level**: 🔴 CRITICAL

---

## ISSUE #1: EMAIL SYSTEM COMPLETELY BROKEN

**Severity**: 🔴 CRITICAL  
**Time to Fix**: 4 hours  
**Affects**: User registration, password resets, invitations, notifications

### The Problem
All email functions are mocks that do nothing:

```typescript
// lib/services/email.ts - Lines 13-160
export async function sendEmail(config: EmailConfig): Promise<void> {
  log.service('EmailService', 'sendEmail', {...});
  await new Promise(resolve => setTimeout(resolve, 100)); // ❌ Does nothing
}

// Same pattern for 8+ functions - all are mocks
sendPasswordResetEmail()      // ❌ Doesn't send reset emails
sendWelcomeEmail()            // ❌ Doesn't send welcome emails
sendInvitationEmail()         // ❌ Doesn't send invitations
sendMaintenanceRequestEmail() // ❌ Doesn't notify
sendPaymentReminderEmail()    // ❌ Doesn't remind
sendLeaseExpirationEmail()    // ❌ Doesn't warn
sendDocumentApprovalNotification() // ❌ Doesn't notify
// + 3 more mock functions
```

### Why It's Critical
- Tenants can't accept property invitations → Can't login
- Users can't reset passwords → Locked out of accounts
- No payment reminders → Users miss due dates
- No system notifications → Silent failures

### How to Fix It

**Option A: SendGrid (Recommended for Nook)**
```bash
# 1. Sign up at sendgrid.com
# 2. Generate API key
# 3. Update .env.local
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
EMAIL_FROM="noreply@nook.app"
EMAIL_FROM_NAME="Nook Team"

# 4. Install SendGrid package
npm install @sendgrid/mail

# 5. Update lib/services/email.ts
import sgMail from '@sendgrid/mail';

export async function sendEmail(config: EmailConfig): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  
  await sgMail.send({
    to: config.to,
    from: process.env.EMAIL_FROM!,
    subject: config.subject,
    html: config.html,
  });
}
```

**Option B: Resend (Newer, Simpler)**
```bash
# 1. Sign up at resend.com
# 2. Generate API key
# 3. Update .env.local
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# 4. Install Resend
npm install resend

# 5. Update lib/services/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(config: EmailConfig): Promise<void> {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: config.to,
    subject: config.subject,
    html: config.html,
  });
}
```

### Testing
```bash
# 1. Create a test email
# 2. Call sendWelcomeEmail("test@example.com")
# 3. Verify email arrives in inbox
# 4. Test each function with real emails
```

### Verification Checklist
- [ ] API key configured in .env.local
- [ ] Package installed (npm install)
- [ ] sendEmail() function updated
- [ ] Test email sent successfully
- [ ] All 8+ email functions updated
- [ ] Deployed to production
- [ ] Email received in production

**Status**: 🔴 **BLOCKING** - Can't launch without this

---

## ISSUE #2: RLS (ROW LEVEL SECURITY) DISABLED

**Severity**: 🔴 CRITICAL  
**Time to Fix**: 4-8 hours  
**Affects**: Data security, compliance, user privacy

### The Problem
All database row-level security is turned OFF:

```
Database State:
- users table: ❌ RLS = OFF (anyone can see all users)
- properties table: ❌ RLS = OFF (anyone can see all properties)
- payments table: ❌ RLS = OFF (anyone can see all payments)
- documents table: ❌ RLS = OFF (anyone can see all documents)
- maintenance_tickets table: ❌ RLS = OFF (anyone can see all tickets)
```

### Security Impact

| What's Exposed | Current Risk | Compliance |
|---|---|---|
| **User emails, names, roles** | Anyone can list all users | ❌ GDPR Violation |
| **Property details, locations** | Tenants can see competing properties | ❌ Privacy Issue |
| **Payment records** | Tenants can see OTHER tenants' payments | ❌ PCI-DSS Violation |
| **Documents** | Anyone can read all leases & documents | ❌ Contract Breach |
| **Maintenance tickets** | Anyone can see all building issues | ❌ Security Issue |

### How to Fix It

**Step 1: Enable RLS on Each Table**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

**Step 2: Create RLS Policies for Users**
```sql
-- Users can only see themselves
CREATE POLICY "Users can view themselves"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin'::user_role);
```

**Step 3: Create RLS Policies for Properties**
```sql
-- Landlords can only see their properties
CREATE POLICY "Landlords see own properties"
ON properties FOR SELECT
USING (owner_id = auth.uid());

-- Tenants can only see units they're assigned to
CREATE POLICY "Tenants see assigned units"
ON properties FOR SELECT
USING (
  id IN (
    SELECT property_id FROM units WHERE id IN (
      SELECT unit_id FROM tenant_assignments WHERE user_id = auth.uid()
    )
  )
);
```

**Step 4: Create RLS Policies for Payments**
```sql
-- Users see only their payments
CREATE POLICY "Users see own payments"
ON payments FOR SELECT
USING (user_id = auth.uid());

-- Landlords see payments for their properties
CREATE POLICY "Landlords see property payments"
ON payments FOR SELECT
USING (
  property_id IN (
    SELECT id FROM properties WHERE owner_id = auth.uid()
  )
);
```

**Step 5: Test Policies**
```typescript
// Test 1: Tenant can only see their own payments
const tenantPayments = await supabase
  .from('payments')
  .select('*')
  .eq('user_id', tenantId);
// Should return: [tenant's payments only]
// Should NOT return: [other tenants' payments]

// Test 2: Landlord can see all their property payments
const landlordPayments = await supabase
  .from('payments')
  .select('*');
// Should return: [all payments for landlord's properties]
// Should NOT return: [payments for other landlords' properties]

// Test 3: User can see all their data
const userData = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
// Should return: [own user record]
// Should NOT return: Error or different user
```

### Verification Checklist
- [ ] RLS enabled on users table
- [ ] RLS enabled on properties table
- [ ] RLS enabled on payments table
- [ ] RLS enabled on documents table
- [ ] RLS enabled on maintenance_tickets table
- [ ] Tenant can't see other tenants' data
- [ ] Landlord can't see other landlords' data
- [ ] Admin can see all data
- [ ] No "PGRST116" (permission denied) errors
- [ ] All tests passing

**Status**: 🔴 **BLOCKING** - Security breach, must fix before launch

---

## ISSUE #3: AUTHENTICATION SYSTEM CONFLICT

**Severity**: 🔴 CRITICAL  
**Time to Fix**: 6-8 hours  
**Affects**: Login/logout, session management, user identification

### The Problem
Two different authentication systems running simultaneously:

```typescript
// System #1: NextAuth (lib/auth.ts)
import { getServerSession } from 'next-auth';
export const auth = () => getServerSession(authOptions);

// System #2: Supabase Auth (lib/supabase/client.ts)
const supabase = createClientComponentClient<Database>();
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// PROBLEM: These create DIFFERENT sessions
// User might be logged in to one but not the other
// Causes session conflicts, logout issues, session corruption
```

### Why It's Critical
- User logs in with NextAuth but Supabase session is empty
- User logs out of Supabase but NextAuth session persists
- Multiple session cookies → conflicts
- Unpredictable behavior across pages
- Security vulnerabilities (confused deputy)

### How to Fix It

**Option A: Use Supabase Auth ONLY (Recommended)**

1. **Remove NextAuth**:
```bash
npm uninstall next-auth @next-auth/providers bcryptjs
rm lib/auth-options.ts
```

2. **Use Supabase for Authentication**:
```typescript
// lib/auth.ts - New version using Supabase
import { createClient } from '@supabase/supabase-js';

export async function getCurrentUser() {
  const supabase = createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function login(email: string, password: string) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data.session?.user;
}

export async function logout() {
  const supabase = createClientComponentClient();
  await supabase.auth.signOut();
}

export async function signup(email: string, password: string, metadata: any) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data.user;
}
```

3. **Update Login Components**:
```typescript
// Before (NextAuth):
import { signIn } from 'next-auth/react';
await signIn('credentials', { email, password, redirect: false });

// After (Supabase):
import { getClient } from '@/lib/supabase/client';
const supabase = getClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw error;
```

4. **Update Middleware**:
```typescript
// middleware.ts - Update to use Supabase
const { data: { session } } = await supabase.auth.getSession();
if (!session && isProtectedRoute) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Option B: Keep NextAuth but Replace Supabase Auth**
(Not recommended - NextAuth doesn't work well with Supabase)

### Verification Checklist
- [ ] Choose one auth system (recommend Supabase)
- [ ] Remove conflicting system
- [ ] Update all login components
- [ ] Update all logout components
- [ ] Update all protected routes
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test session persistence
- [ ] Test multiple tabs (session sync)
- [ ] No duplicate sessions

**Status**: 🔴 **BLOCKING** - Session corruption risks

---

## ISSUE #4: PRODUCTION KEYS NOT CONFIGURED

**Severity**: 🔴 CRITICAL  
**Time to Fix**: 1 hour (+ waiting for Stripe)  
**Affects**: Payments, webhooks, email in production

### The Problem
`.env.local` contains test/dev credentials:

```env
# ❌ TEST MODE (Won't process real payments)
STRIPE_SECRET_KEY="sk_test_51RANaL2N6M0EFvPr..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51RANaL..."

# ❌ MISSING (Webhooks won't verify)
STRIPE_WEBHOOK_SECRET=""

# ❌ EMPTY (Email won't send)
SENDGRID_API_KEY=""
```

### Why It's Critical
- Test Stripe keys work only in test mode
- Real payments won't process in production
- Webhook secret is empty → anyone can send fake webhooks
- Email API key missing → emails won't send
- Can't verify payment events are legitimate

### How to Fix It

**Step 1: Get Production Stripe Keys**
```bash
1. Go to https://dashboard.stripe.com/apikeys
2. Switch from "Test data" to "Live data" (toggle in top right)
3. Copy "Secret key" starting with "sk_live_"
4. Copy "Publishable key" starting with "pk_live_"
5. Note: These are PRODUCTION keys - guard them carefully
```

**Step 2: Get Webhook Secret**
```bash
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: https://yourdomain.com/api/stripe/webhook
4. Select events: payment_intent.succeeded, invoice.paid, etc.
5. Copy "Signing secret" starting with "whsec_"
```

**Step 3: Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```
# Stripe (Production)
STRIPE_SECRET_KEY = sk_live_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_XXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXXXXXXXXXX

# Email
SENDGRID_API_KEY = SG.XXXXXXXXXXXXXXXX
(or RESEND_API_KEY = re_XXXXXXXXXXXXXXXX)

# Supabase (Should already be set)
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
```

**Step 4: Verify Configuration**
```bash
# Don't commit keys to git
echo "Never commit .env.local to git!"
git rm --cached .env.local
echo ".env.local" >> .gitignore

# Verify keys are in Vercel
# (Don't print them - just verify they're set)
```

**Step 5: Test Production Keys**
```typescript
// Test that Stripe keys work
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const customers = await stripe.customers.list({ limit: 1 });
// If successful, keys are valid
```

### Verification Checklist
- [ ] Stripe secret key configured (sk_live_...)
- [ ] Stripe publishable key configured (pk_live_...)
- [ ] Webhook secret configured (whsec_...)
- [ ] Email API key configured
- [ ] Keys set in Vercel dashboard
- [ ] Keys NOT in .env.local
- [ ] .env.local in .gitignore
- [ ] Keys tested and working
- [ ] Webhook endpoint registered in Stripe

**Status**: 🔴 **BLOCKING** - Can't process payments without this

---

## ISSUE #5: INSUFFICIENT TEST COVERAGE

**Severity**: 🟠 HIGH  
**Time to Fix**: 20+ hours  
**Affects**: Feature reliability, regression detection

### The Problem
~95% of code is untested:

```
Current State:
- Unit tests: ~5 files, incomplete
- E2E tests: Exist but fail/incomplete
- Integration tests: 0
- Security tests: Basic only
- Load tests: 0
- Overall coverage: ~5%

Risk: Any change could break production
```

### Why It's Critical (For Production)
- Regressions aren't caught
- Broken features go live
- Manual testing takes hours
- Hard to refactor safely
- New team members break things

### How to Fix It

**Phase 1: Unit Tests (10 hours)**
```bash
# Test critical functions
npm run test:unit:watch

# Target coverage:
# - Auth functions: 100%
# - Payment functions: 100%
# - Email functions: 100%
# - Utility functions: 90%+
# - Overall: 80%+
```

**Phase 2: E2E Tests (10 hours)**
```bash
# Test user workflows
npm run test:e2e:comprehensive

# Test scenarios:
# - User registration
# - User login
# - Landlord onboarding
# - Property creation
# - Tenant invitation
# - Payment processing
# - Document upload
# - Maintenance request
```

### Verification Checklist
- [ ] 80%+ unit test coverage
- [ ] Critical E2E tests passing
- [ ] No console errors in tests
- [ ] Load testing completed
- [ ] Security tests passing

**Status**: 🟠 **HIGH PRIORITY** - Can wait a few days but needed before launch

---

## PRIORITY FIX ORDER

### Must Fix First (Blocking Deployment)
1. **Email System** (4 hours)
   - After: Users can receive invitations
   
2. **RLS Security** (8 hours)
   - After: Data access is controlled
   
3. **Auth System** (6 hours)
   - After: Login/logout works reliably
   
4. **Production Keys** (1 hour)
   - After: Payments can be processed

**Total**: 19 hours = 2-3 days

### Then Do (Before Going Live)
5. **Test Coverage** (20+ hours)
   - After: Confident in code quality

---

## QUICK CHECKLIST

```
Before Pushing to Vercel:
[ ] Email system implemented and tested
[ ] RLS policies created and tested
[ ] Auth system consolidated
[ ] Production Stripe keys configured
[ ] Production SendGrid key configured
[ ] .env.local not committed to git
[ ] All console.logs removed
[ ] Critical tests passing (70%+)
[ ] npm run build succeeds
[ ] No security warnings
[ ] Rollback plan documented
```

---

## GETTING HELP

If you get stuck:

1. **Email Issues?**
   - Check SendGrid/Resend API key
   - Check EMAIL_FROM address
   - Check email template HTML

2. **RLS Issues?**
   - Check Supabase SQL error messages
   - Test policies with simpler rules first
   - Watch out for recursion (policies calling functions calling policies)

3. **Auth Issues?**
   - Check session cookies in browser DevTools
   - Look for CORS errors
   - Verify callback URLs match

4. **Stripe Issues?**
   - Verify webhook secret in env vars
   - Check Stripe webhook logs
   - Test with test keys first

---

**Next Step**: Start with Issue #1 (Email). It's the quickest win and will unblock user invitations.
