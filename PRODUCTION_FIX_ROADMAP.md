# 🚀 PRODUCTION FIX ROADMAP - PRIORITY EXECUTION GUIDE

**Current State**: Build ✅ | Code ❌ | Security ❌ | Tests ❌ | Ready for Prod: 🔴 NO

**Estimated Time to Production**: 21-30 hours (3-4 days)

---

## PHASE 1: SECURITY FIXES (12 hours) - DAY 1-2

### Step 1: Fix Email System (4 hours) ⚡ START HERE

**Why First?** Unblocks user invitations. Can be done independently.

1. **Choose Email Provider** (5 min)
   ```bash
   # Option A: SendGrid (recommended for Nook)
   npm install @sendgrid/mail
   
   # Option B: Resend (simpler, newer)
   npm install resend
   ```

2. **Update Environment Variables** (10 min)
   ```env
   # Get API key from sendgrid.com or resend.com
   SENDGRID_API_KEY="SG.xxxxx"  # or
   RESEND_API_KEY="re_xxxxx"
   
   EMAIL_FROM="noreply@nook.app"
   EMAIL_FROM_NAME="Nook Team"
   ```

3. **Update lib/services/email.ts** (1 hour)
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   export async function sendEmail(config: EmailConfig): Promise<void> {
     sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
     
     try {
       await sgMail.send({
         to: config.to,
         from: process.env.EMAIL_FROM!,
         subject: config.subject,
         html: config.html,
       });
       
       log.service('EmailService', 'sendEmail', {
         to: config.to,
         subject: config.subject,
       });
     } catch (error) {
       log.error('Email send failed:', error as Error);
       throw error;
     }
   }
   
   // Update all other functions to use sendEmail():
   export async function sendWelcomeEmail(email: string): Promise<void> {
     return sendEmail({
       to: email,
       subject: 'Welcome to Nook!',
       html: '<h1>Welcome</h1><p>You\'ve been added to Nook.</p>',
     });
   }
   
   export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
     return sendEmail({
       to: email,
       subject: 'Reset Your Password',
       html: `<p>Click to reset: <a href="${resetLink}">Reset Password</a></p>`,
     });
   }
   
   // ... repeat for all 8 functions
   ```

4. **Test Email Sending** (1 hour)
   ```typescript
   // Create a test endpoint
   // app/api/test-email/route.ts
   export async function POST() {
     try {
       await sendWelcomeEmail('your-email@example.com');
       return NextResponse.json({ success: true });
     } catch (error) {
       return NextResponse.json({ error }, { status: 500 });
     }
   }
   
   // Call: POST /api/test-email
   // Verify email arrives
   ```

5. **Deploy and Verify** (30 min)
   ```bash
   npm run build
   # Should succeed with no errors
   
   git add .
   git commit -m "fix: implement SendGrid email integration"
   git push  # Auto-deploys to Vercel
   
   # Test in production
   # POST https://yourdomain.com/api/test-email
   ```

**✅ Verification**: Email arrives in inbox within 10 seconds

---

### Step 2: Fix RLS Security (4-8 hours)

**Why Second?** Critical security fix. Can't skip.

1. **Enable RLS on All Tables** (30 min)
   ```bash
   # Open Supabase SQL Editor
   # Run all these commands:
   
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
   ALTER TABLE units ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
   
   # Verify RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE rowsecurity = true;
   ```

2. **Create RLS Policies for Users** (1 hour)
   ```sql
   -- Users see only themselves
   DROP POLICY IF EXISTS "Users view own" ON users;
   CREATE POLICY "Users view own"
   ON users FOR SELECT
   USING (auth.uid() = id);
   
   -- Admins see all users
   DROP POLICY IF EXISTS "Admins view all" ON users;
   CREATE POLICY "Admins view all"
   ON users FOR SELECT
   USING (
     (SELECT role FROM users WHERE id = auth.uid())::text = 'admin'
   );
   
   -- Update own profile
   DROP POLICY IF EXISTS "Users update own" ON users;
   CREATE POLICY "Users update own"
   ON users FOR UPDATE
   USING (auth.uid() = id);
   ```

3. **Create RLS Policies for Properties** (1 hour)
   ```sql
   -- Landlords see own properties
   DROP POLICY IF EXISTS "Landlords view own properties" ON properties;
   CREATE POLICY "Landlords view own properties"
   ON properties FOR SELECT
   USING (owner_id = auth.uid());
   
   -- Tenants see properties with units they're in
   DROP POLICY IF EXISTS "Tenants view assigned properties" ON properties;
   CREATE POLICY "Tenants view assigned properties"
   ON properties FOR SELECT
   USING (
     id IN (
       SELECT DISTINCT p.id 
       FROM properties p
       JOIN units u ON u.property_id = p.id
       JOIN leases l ON l.unit_id = u.id
       WHERE l.tenant_id = auth.uid()
     )
   );
   
   -- Admins see all
   DROP POLICY IF EXISTS "Admins view all properties" ON properties;
   CREATE POLICY "Admins view all properties"
   ON properties FOR SELECT
   USING ((SELECT role FROM users WHERE id = auth.uid())::text = 'admin');
   ```

4. **Create RLS Policies for Payments** (1 hour)
   ```sql
   -- Users see own payments
   DROP POLICY IF EXISTS "Users view own payments" ON payments;
   CREATE POLICY "Users view own payments"
   ON payments FOR SELECT
   USING (tenant_id = auth.uid() OR landlord_id = auth.uid());
   
   -- Admins see all
   DROP POLICY IF EXISTS "Admins view all payments" ON payments;
   CREATE POLICY "Admins view all payments"
   ON payments FOR SELECT
   USING ((SELECT role FROM users WHERE id = auth.uid())::text = 'admin');
   ```

5. **Create RLS Policies for Documents** (1 hour)
   ```sql
   -- Users see documents for properties/units they have access to
   DROP POLICY IF EXISTS "Users view accessible documents" ON documents;
   CREATE POLICY "Users view accessible documents"
   ON documents FOR SELECT
   USING (
     property_id IN (
       SELECT id FROM properties WHERE owner_id = auth.uid()
       UNION
       SELECT p.id FROM properties p
       JOIN units u ON u.property_id = p.id
       JOIN leases l ON l.unit_id = u.id
       WHERE l.tenant_id = auth.uid()
     )
   );
   ```

6. **Create RLS Policies for Maintenance** (1 hour)
   ```sql
   -- Similar pattern for maintenance tickets
   DROP POLICY IF EXISTS "Users view accessible tickets" ON maintenance_tickets;
   CREATE POLICY "Users view accessible tickets"
   ON maintenance_tickets FOR SELECT
   USING (
     property_id IN (
       SELECT id FROM properties WHERE owner_id = auth.uid()
       UNION
       SELECT p.id FROM properties p
       JOIN units u ON u.property_id = p.id
       JOIN leases l ON l.unit_id = u.id
       WHERE l.tenant_id = auth.uid()
     )
   );
   ```

7. **Test RLS Policies** (1 hour)
   ```typescript
   // Test as tenant - should only see own data
   const supabase = getClient(); // Logged in as tenant
   const { data: myPayments } = await supabase
     .from('payments')
     .select('*');
   // Should return: [my payments only]
   // Should NOT return: [other tenants' payments]
   
   // Test as landlord - should only see own property data
   const { data: myProperties } = await supabase
     .from('properties')
     .select('*');
   // Should return: [my properties only]
   
   // Test as admin - should see all data
   // (Switch to admin account)
   const { data: allPayments } = await supabase
     .from('payments')
     .select('*');
   // Should return: [all payments]
   ```

**✅ Verification**: 
- [ ] RLS enabled on all tables
- [ ] Tenant can't see other tenants' data
- [ ] Landlord can't see other landlords' data
- [ ] Admin can see all data
- [ ] No "PGRST116" errors

---

### Step 3: Fix Auth System Conflict (6 hours)

**Why Third?** Consolidates sessions, removes conflicts.

1. **Choose Auth System** (5 min)
   - **Recommended**: Supabase Auth (matches database)
   - Remove: NextAuth (conflicting system)

2. **Remove NextAuth** (1 hour)
   ```bash
   npm uninstall next-auth @next-auth/providers bcryptjs
   rm lib/auth-options.ts
   ```

3. **Update lib/auth.ts** (2 hours)
   ```typescript
   import { createServerComponentClient, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';
   import { log } from '@/lib/logger';
   
   // Server-side: Get current user
   export async function getCurrentUser() {
     try {
       const supabase = createServerComponentClient({ cookies });
       const { data: { session } } = await supabase.auth.getSession();
       return session?.user || null;
     } catch (error) {
       log.error('Error getting current user:', error as Error);
       return null;
     }
   }
   
   // Client-side: Login
   export async function login(email: string, password: string) {
     try {
       const supabase = createClientComponentClient();
       const { data, error } = await supabase.auth.signInWithPassword({
         email,
         password,
       });
       
       if (error) throw error;
       return data.session?.user;
     } catch (error) {
       log.error('Login error:', error as Error);
       throw error;
     }
   }
   
   // Client-side: Logout
   export async function logout() {
     try {
       const supabase = createClientComponentClient();
       await supabase.auth.signOut();
     } catch (error) {
       log.error('Logout error:', error as Error);
       throw error;
     }
   }
   
   // Client-side: Sign up
   export async function signup(
     email: string,
     password: string,
     metadata: {
       name: string;
       role: string;
     }
   ) {
     try {
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
     } catch (error) {
       log.error('Signup error:', error as Error);
       throw error;
     }
   }
   ```

4. **Update Middleware** (1 hour)
   ```typescript
   // middleware.ts
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   
   export async function middleware(request: NextRequest) {
     const supabase = createServerComponentClient({ cookies });
     const { data: { session } } = await supabase.auth.getSession();
     
     // Protected routes
     const protectedRoutes = [
       '/dashboard',
       '/properties',
       '/payments',
       '/documents',
     ];
     
     const isProtected = protectedRoutes.some(route =>
       request.nextUrl.pathname.startsWith(route)
     );
     
     if (!session && isProtected) {
       return NextResponse.redirect(new URL('/login', request.url));
     }
     
     return NextResponse.next();
   }
   ```

5. **Update All Login Components** (2 hours)
   ```typescript
   // Before: Using NextAuth
   import { signIn } from 'next-auth/react';
   const result = await signIn('credentials', { email, password });
   
   // After: Using Supabase
   import { login } from '@/lib/auth';
   const user = await login(email, password);
   if (user) router.push('/dashboard');
   ```

**✅ Verification**:
- [ ] NextAuth removed
- [ ] Supabase Auth working
- [ ] Login succeeds
- [ ] Logout clears session
- [ ] Protected routes redirect
- [ ] Session persists across page refresh
- [ ] No duplicate sessions

---

### Step 4: Configure Production Keys (1 hour)

**Why Fourth?** Enables real payment processing.

1. **Get Stripe Production Keys** (10 min)
   ```bash
   # Go to https://dashboard.stripe.com/apikeys
   # Toggle "Live data" (top right)
   # Copy Secret key: sk_live_...
   # Copy Publishable key: pk_live_...
   
   # DO NOT share these keys
   # DO NOT commit to git
   ```

2. **Get Stripe Webhook Secret** (10 min)
   ```bash
   # Go to https://dashboard.stripe.com/webhooks
   # Add endpoint: https://yourdomain.com/api/stripe/webhook
   # Select events: all payment/invoice events
   # Copy Signing secret: whsec_...
   ```

3. **Get Email API Key** (5 min)
   ```bash
   # SendGrid: https://app.sendgrid.com/settings/api_keys
   # Copy API key: SG_...
   
   # OR Resend: https://resend.com/api-keys
   # Copy API key: re_...
   ```

4. **Set in Vercel Dashboard** (20 min)
   ```bash
   # Go to Vercel → Your Project → Settings → Environment Variables
   
   # Add/Update:
   STRIPE_SECRET_KEY = sk_live_XXXXXXXX
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_XXXXXXXX
   STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXX
   SENDGRID_API_KEY = SG_XXXXXXXX
   
   # Redeploy after setting env vars
   # (Vercel will auto-redeploy or manual redeploy needed)
   ```

**✅ Verification**:
- [ ] Production Stripe keys set
- [ ] Webhook secret configured
- [ ] Email API key configured
- [ ] Keys in Vercel (not .env.local)
- [ ] .env.local in .gitignore
- [ ] Stripe test webhook successful

---

## PHASE 2: CODE CLEANUP (8 hours) - DAY 3

### Step 5: Remove Console.logs (2 hours)

**Why?** Console.logs leak information, make logs noisy.

```bash
# Find all console.logs
grep -r "console\." --include="*.ts" --include="*.tsx" app/ lib/ components/ \
  | grep -v "node_modules" | grep -v ".next"

# Use logger instead:
// Before
console.log('User logged in:', user);
console.error('Payment failed:', error);

// After
import { log } from '@/lib/logger';
log.info('User logged in', { userId: user.id });
log.error('Payment failed', error);
```

**Files to Update** (50+ locations):
- `app/simple-login/page.tsx`
- `app/error.tsx`
- `app/invite/[id]/page.tsx`
- (+ 47 more files)

---

### Step 6: Replace `any` Types (3 hours)

**Why?** Type-safety. Catches bugs at compile time.

```bash
# Find all `any` types
grep -r ": any" --include="*.ts" --include="*.tsx" app/ lib/ components/ \
  | grep -v "node_modules"

# Fix them:
// Before
const [properties, setProperties] = useState<any[]>([]);

// After
interface Property {
  id: string;
  name: string;
  address: string;
  // ...
}

const [properties, setProperties] = useState<Property[]>([]);
```

---

### Step 7: Replace Mock Implementations (3 hours)

**Why?** Mocks break in production.

```typescript
// Before: lib/services/usage.ts
export async function checkUsageLimits(organizationId: string) {
  // Mock implementation for now ❌
  return {
    propertyCount: 5,
    unitCount: 25,
    superCount: 3,
  };
}

// After: Real implementation
export async function checkUsageLimits(organizationId: string) {
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('organization_id', organizationId);
  
  const { data: units } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', 'in', properties.map(p => p.id));
  
  return {
    propertyCount: properties?.length || 0,
    unitCount: units?.length || 0,
    // ...
  };
}
```

---

## PHASE 3: TESTING (20+ hours) - DAY 4-6

### Step 8: Unit Tests

```bash
npm run test:unit:watch

# Aim for 80%+ coverage:
# - Auth functions: 100%
# - Payment functions: 100%
# - Email functions: 100%
# - Utils: 90%+
```

### Step 9: E2E Tests

```bash
npm run test:e2e:comprehensive

# Test flows:
# - User registration
# - User login
# - Property creation
# - Tenant invitation
# - Payment processing
# - Document upload
```

---

## DEPLOYMENT CHECKLIST

Before pushing to production:

```
Code
[ ] npm run build succeeds
[ ] npm run lint passes
[ ] No console errors
[ ] No console.logs in prod code
[ ] All `any` types replaced
[ ] No mock implementations

Security
[ ] RLS enabled and tested
[ ] Auth system consolidated
[ ] No hardcoded secrets
[ ] CORS restricted
[ ] Security headers set

Configuration
[ ] Production Stripe keys set
[ ] Webhook secret configured
[ ] Email API key configured
[ ] Environment variables in Vercel
[ ] .env.local not committed

Testing
[ ] Build tests pass
[ ] Unit tests pass (70%+)
[ ] E2E tests pass
[ ] Manual smoke tests pass

Documentation
[ ] Rollback plan documented
[ ] Incident response plan created
[ ] Emergency contacts listed
```

---

## ROLLBACK PLAN

If something breaks in production:

### Immediate (First 10 minutes)
1. Identify the issue
2. Check error logs (Vercel, Supabase)
3. Decide: Rollback or Hotfix

### Rollback (If critical)
```bash
# Go to Vercel Dashboard
# Deployments tab
# Click the previous working deployment
# Click "Redeploy"

# Takes ~3 minutes
```

### Hotfix (If minor)
```bash
git revert <broken-commit>
git push
# Vercel auto-deploys (~2 minutes)
```

### Post-Incident
1. Document what happened
2. Root cause analysis
3. Prevent repeat with better tests/monitoring

---

## SUCCESS METRICS

| Metric | Current | Target | When |
|--------|---------|--------|------|
| Build Time | - | <2 min | After cleanup |
| Test Coverage | 5% | 80%+ | Before launch |
| Security Score | 30 | 90+ | Before launch |
| RLS Enabled | 0% | 100% | Phase 1 |
| Email Working | 0% | 100% | Phase 1 |
| Auth Consolidated | 0% | 100% | Phase 1 |

---

## ESTIMATED TIMELINE

| Phase | Task | Hours | Days | Cumulative |
|-------|------|-------|------|------------|
| 1.1 | Email System | 4 | 1 | 4h |
| 1.2 | RLS Security | 8 | 1-2 | 12h |
| 1.3 | Auth System | 6 | 1 | 18h |
| 1.4 | Prod Keys | 1 | <1 | 19h |
| 2.1 | Code Cleanup | 8 | 1 | 27h |
| 3.1 | Testing | 20 | 2-3 | 47h |

**Minimum to Production**: 19 hours (2-3 days)  
**Recommended**: 27 hours (3-4 days)  
**Optimal**: 47 hours (1 week)

---

## GET STARTED NOW

Pick ONE task and complete it:

✅ **TASK 1 (4 hours)**: Implement SendGrid email
- Get SendGrid API key
- Update lib/services/email.ts
- Test with test email
- Commit and deploy

After task 1 is done, move to task 2.

**Next**: Fix RLS Security (8 hours)
