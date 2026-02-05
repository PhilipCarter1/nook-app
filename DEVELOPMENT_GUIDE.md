# Nook MVP - Development Guide

**Last Updated:** February 4, 2026  
**Target Audience:** Development Team

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/nook-app.git
cd nook-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Then edit .env.local with your values
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Tests

```bash
# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# All tests
npm run test
```

---

## Project Structure

```
nook-app/
├── app/                       # Next.js App Router
│   ├── (dashboard)/          # Dashboard routes (protected)
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── webhooks/        # Webhook handlers
│   │   ├── create-checkout-session/
│   │   └── ...
│   ├── auth/                # Auth pages (login, signup, etc.)
│   ├── dashboard/           # User dashboards
│   ├── login/
│   ├── signup/
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── auth/               # Auth-related components
│   ├── providers/          # Context providers
│   └── ui/                 # UI components (shadcn/ui)
├── lib/                    # Utility functions
│   ├── auth-actions.ts    # Server-side auth functions
│   ├── supabase/
│   │   ├── client.ts      # Browser Supabase client
│   │   └── server.ts      # Server Supabase client
│   ├── stripe.ts
│   ├── email-service.ts
│   ├── logger.ts
│   └── types.ts
├── types/                  # TypeScript types
│   ├── supabase.ts        # Database types (generated)
│   └── index.ts
├── public/                 # Static assets
├── tests/                  # Test files
│   ├── e2e/              # Playwright tests
│   └── unit/             # Vitest tests
├── supabase/             # Supabase migrations
│   ├── seed.sql
│   └── functions/
├── middleware.ts         # Next.js middleware
├── next.config.cjs      # Next.js config
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
└── package.json

```

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (React 18) | Full-stack framework |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Pre-built accessible components |
| Database | PostgreSQL (Supabase) | Relational database |
| Auth | Supabase Auth | Email/password authentication |
| Payments | Stripe | Payment processing |
| Email | Resend | Email delivery |
| Hosting | Vercel | Edge functions & deployment |
| Testing | Vitest + Playwright | Unit & E2E tests |
| Monitoring | Sentry | Error tracking |

---

## Core Concepts

### Server vs Browser Code

**Server-side (use these):**
- `lib/auth-actions.ts` - Sign up, login, password reset
- `lib/supabase/server.ts` - Database access with RLS
- `app/api/**/route.ts` - API endpoints
- Server Components in App Router

**Browser-side (for Client Components):**
- `lib/supabase/client.ts` - Read-only Supabase client
- React hooks for state management
- Use `useAuth()` hook for auth state

**⚠️ SECURITY: Never export service role key or secrets to browser!**

### Authentication Flow

```
User submits form
    ↓
Server Action (lib/auth-actions.ts)
    ↓
Supabase Auth API
    ↓
Creates Auth user + DB user record
    ↓
Auth context updates (useAuth hook)
    ↓
Redirect to dashboard
```

### Payment Flow

```
User clicks "Pay"
    ↓
POST /api/create-checkout-session
    ↓
Creates Stripe checkout session
    ↓
Stores payment record in DB
    ↓
Redirects to Stripe checkout
    ↓
User pays
    ↓
Stripe sends webhook
    ↓
POST /api/webhooks/stripe
    ↓
Updates payment status in DB
    ↓
Sends confirmation email
```

---

## Common Tasks

### Add a New API Route

Create `app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const data = await request.json();

    // Validate input
    if (!data.required_field) {
      return NextResponse.json(
        { error: 'Missing required_field' },
        { status: 400 }
      );
    }

    // Do something
    const result = { success: true, data };

    log.info('Action completed');
    return NextResponse.json(result);
  } catch (error: any) {
    log.error('Error in POST /api/your-route:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Add a New Supabase Query

```typescript
// In a Server Component or API route
import { createServerClient } from '@/lib/supabase/server';

async function getPropertyData() {
  const supabase = createServerClient();
  const user = await requireAuth();

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Add a New Email Template

Add template function to `lib/email-templates.ts`:

```typescript
export const emailTemplates = {
  myNewTemplate: (name: string) => ({
    subject: 'My Email Subject',
    html: `
      <div style="font-family: sans-serif;">
        <h1>Hello ${name}!</h1>
        <p>Your message here.</p>
      </div>
    `,
  }),
};
```

Then use it:

```typescript
import { sendEmail } from '@/lib/email-service';

await sendEmail({
  to: 'user@example.com',
  template: 'myNewTemplate',
  data: { name: 'John' },
});
```

### Add a Protected Page

Create a page in `app/(dashboard)/your-page/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/server';

export default async function YourPage() {
  // This will redirect to /login if not authenticated (middleware)
  const user = await requireAuth();

  // Get user data
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <h1>Welcome, {profile?.first_name}!</h1>
      {/* Your content */}
    </div>
  );
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'tenant',
  stripe_customer_id TEXT,
  phone TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles: tenant, landlord, property_manager, admin, super
```

### Properties Table

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL, -- apartment, house, condo
  monthly_rent NUMERIC NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Leases Table

```sql
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
```

### Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lease_id UUID REFERENCES leases(id),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
npm run test:unit:watch  # Watch mode
```

Example test:

```typescript
// tests/unit/auth.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from '@/lib/utils';

describe('validateEmail', () => {
  it('validates email correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui    # Interactive UI
npm run test:e2e:debug # Debug mode
```

Example test:

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button:has-text("Sign Up")');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Logging

Use the `log` utility for consistent logging:

```typescript
import { log } from '@/lib/logger';

log.info('User signed up:', { email, id });
log.warn('Deprecated API endpoint used');
log.error('Database connection failed:', error);
```

Logs appear in:
- **Development:** Console
- **Production:** Sentry

---

## Debugging Tips

### Check Auth State in Browser

Open browser DevTools Console:

```javascript
// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log(session);

// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

### Check Database Directly

In Supabase Studio:

1. Go to your project
2. Click **SQL Editor**
3. Run queries directly:
   ```sql
   SELECT * FROM users WHERE id = '...';
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
   ```

### View Stripe Webhooks

In Stripe Dashboard:

1. Go to **Developers → Webhooks**
2. Click your endpoint
3. View recent events and their payloads

### Check Vercel Logs

```bash
# Live logs
vercel logs --prod

# Or in Vercel dashboard: Deployments → Logs
```

---

## Environment Variables in Development

Copy key values to `.env.local`:

```dotenv
# Required for testing
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe test keys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
STRIPE_PRICE_ID="price_..."

# Resend test mode
RESEND_API_KEY="re_..."
```

---

## Common Errors & Solutions

### "Not authenticated"
- Check user is logged in: `await requireAuth()`
- Verify cookies are being set
- Check middleware is not blocking request
- Clear browser cookies and retry

### "RLS policy violation"
- Verify RLS policies are correct in Supabase
- Check user ID matches data ownership
- Admin users need separate policies

### "Stripe webhook not processing"
- Check webhook secret in environment
- Verify webhook URL is correct
- Check Stripe dashboard for webhook logs
- Ensure request returns 200 status

### "Email not sending"
- In dev: Check console for mock email
- In prod: Verify Resend API key
- Check sender domain is verified
- Check Resend logs at resend.com

---

## Code Style & Standards

- **Language:** TypeScript (strict mode)
- **Formatting:** Prettier (auto-formatted)
- **Linting:** ESLint
- **Components:** Functional components with hooks
- **Naming:** camelCase for variables/functions, PascalCase for components
- **Error Handling:** Always wrap async code in try/catch
- **Logging:** Use `log` utility instead of `console.log`
- **Security:** Never log sensitive data (passwords, tokens)

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature

# After review and merge
git checkout main
git pull origin main
```

---

## Performance & Monitoring

### Lighthouse Score Target
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### Monitor in Production
- **Vercel Analytics:** https://vercel.com/analytics
- **Sentry:** https://sentry.io
- **Supabase Dashboard:** https://app.supabase.com

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run all tests
npm run test:unit      # Unit tests only
npm run test:e2e       # E2E tests only

# Database
npm run db:generate    # Generate Drizzle migrations
npm run db:push        # Push migrations to database
npm run db:studio      # Open Drizzle Studio

# Deployment
npm run deploy         # Deploy to Vercel
vercel env pull        # Pull Vercel env vars
```

---

## Next Steps for Development

1. **Understand Auth:** Review `components/providers/auth-provider.tsx`
2. **Learn DB Queries:** Check `lib/supabase/server.ts` examples
3. **Build Feature:** Start with a simple API route
4. **Add Tests:** Cover happy path + error cases
5. **Deploy:** Push to feature branch for review

---

## Questions?

- Check existing issues in GitHub
- Review the PRODUCTION_DEPLOYMENT_GUIDE.md
- Ask in the development team Slack
- Check Supabase/Stripe/Vercel docs

---

Happy coding! 🚀
