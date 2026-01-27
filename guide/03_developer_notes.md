# Developer Notes for Nook

This document provides internal technical guidance for developing and maintaining the Nook platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Database Schema](#database-schema)
4. [File Structure](#file-structure)
5. [Core Features](#core-features)
6. [Recent Fixes](#recent-fixes)
7. [Known Issues & Workarounds](#known-issues--workarounds)
8. [Development Workflow](#development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes, Supabase Functions
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (docs, avatars)
- **Authentication**: Supabase Auth
- **Payments**: Stripe API
- **Email**: SendGrid API
- **Deployment**: Vercel

### High-Level Flow

```
User → Next.js Frontend → Supabase Auth → Auth Context → Role Check → Dashboard
                              ↓
                        Supabase Database
                        (PostgreSQL)
                              ↓
                      Row Level Security (RLS)
```

---

## Authentication & Authorization

### Key Components

**1. Supabase Auth (Backend)**
- Handles user registration, login, password reset
- Manages JWT tokens and sessions
- Located: Supabase Dashboard → Authentication

**2. AuthProvider (`components/providers/auth-provider.tsx`)**
- React Context wrapper for authentication state
- Fetches user profile from `public.users` table
- Handles role-based redirects
- Manages auth state changes (login, logout, token refresh)

**3. Auth Callback (`app/auth/callback/route.ts`)**
- Handles OAuth callback after email verification
- Maps user role to correct dashboard
- Returns `getRoleDashboardPath()` based on role

**4. PremiumAuthForm (`components/auth/PremiumAuthForm.tsx`)**
- Sign-up and login form component
- Validates email, password, confirm password
- Creates user in `public.users` table after auth signup

### Authentication Flow

#### Sign-Up Flow

```
User fills signup form
    ↓
Form validates (email, password, name, role)
    ↓
supabase.auth.signUp() creates auth account
    ↓
supabase.from('users').insert() creates user profile
    ↓
User receives confirmation email
    ↓
User confirms email
    ↓
User can log in
```

#### Login Flow

```
User enters email/password
    ↓
supabase.auth.signInWithPassword()
    ↓
AuthProvider fetches user profile from public.users
    ↓
AuthProvider checks user.role
    ↓
AuthProvider redirects to role-specific dashboard
```

### Role-Based Access Control (RBAC)

Nook supports 5 roles with specific permissions:

| Role | Dashboard | Features | Can Access |
|------|-----------|----------|-----------|
| **Tenant** | `/dashboard/tenant` | View lease, upload docs, pay rent | Own property data |
| **Landlord** | `/dashboard/landlord` | Approve docs, view tenants, manage properties | Properties they own |
| **Property Manager** | `/dashboard/manager` | Manage properties for landlords | Assigned properties |
| **Super** | `/super/dashboard` | Create/manage maintenance tickets | Building maintenance |
| **Admin** | `/admin/dashboard` | Full system access, user management | All data |

### Role Mapping

**In Database** (`public.users.role`):
```sql
create type user_role as enum ('admin', 'landlord', 'tenant', 'property_manager', 'super');
```

**In TypeScript** (`lib/types.ts`):
```typescript
export type UserRole = 'admin' | 'landlord' | 'tenant' | 'property_manager' | 'super';
```

**Dashboard Path Mapping** (`auth/callback/route.ts` → `getRoleDashboardPath()`):
```typescript
switch (role.toLowerCase()) {
  case 'admin': return '/admin/dashboard';
  case 'landlord': return '/dashboard/landlord';
  case 'tenant': return '/dashboard/tenant';
  case 'property_manager' || 'manager': return '/dashboard/manager';
  case 'super' || 'superintendent': return '/super/dashboard';
}
```

### Session Management

- Sessions are handled by Supabase Auth
- JWT tokens stored in HttpOnly cookies (secure)
- Token refresh happens automatically
- `AuthProvider` watches for auth state changes via `onAuthStateChange()`

### Row Level Security (RLS)

All tables have RLS policies. Key policies:

```sql
-- Users can view their own profile
create policy "Users view own profile" on users
  for select using (auth.uid() = id);

-- Users can view their role-specific data
create policy "Users view role-specific data" on properties
  for select using (
    -- Logic varies by role (landlord_id = auth.uid(), tenant_id = auth.uid(), etc.)
  );
```

---

## Database Schema

### Core Tables

**1. users**
- `id` (UUID, PK)
- `email` (text, unique)
- `first_name`, `last_name` (text)
- `name` (text)
- `role` (enum: admin, landlord, tenant, property_manager, super)
- `avatar_url` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**2. properties**
- `id` (UUID, PK)
- `landlord_id` (FK → users)
- `name` (text)
- `address` (text)
- `units_count` (integer)
- `status` (enum: available, rented, maintenance)
- `created_at`, `updated_at` (timestamps)

**3. leases**
- `id` (UUID, PK)
- `property_id` (FK → properties)
- `tenant_id` (FK → users)
- `start_date`, `end_date` (dates)
- `monthly_rent` (decimal)
- `status` (enum: pending, active, terminated)
- `created_at`, `updated_at` (timestamps)

**4. documents**
- `id` (UUID, PK)
- `lease_id` (FK → leases)
- `type` (text: lease, id, proof_of_income, etc.)
- `status` (enum: pending, approved, rejected)
- `uploaded_by` (FK → users)
- `approved_by` (FK → users, nullable)
- `file_url` (text)
- `created_at`, `updated_at` (timestamps)

**5. maintenance_tickets**
- `id` (UUID, PK)
- `property_id` (FK → properties)
- `title`, `description` (text)
- `status` (enum: open, in_progress, resolved, closed)
- `priority` (enum: low, medium, high, urgent)
- `created_by` (FK → users)
- `assigned_to` (FK → users, nullable)
- `created_at`, `updated_at` (timestamps)

**6. payments**
- `id` (UUID, PK)
- `lease_id` (FK → leases)
- `amount` (decimal)
- `due_date` (date)
- `status` (enum: pending, paid, overdue, failed)
- `payment_method` (enum: stripe, bank_transfer, cash)
- `paid_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

### Key Relationships

```
users (1) ──── (N) properties (via landlord_id)
       (1) ──── (N) leases (via tenant_id)
       (1) ──── (N) documents (via uploaded_by, approved_by)
       (1) ──── (N) maintenance_tickets (via created_by, assigned_to)
       (1) ──── (N) payments

properties (1) ──── (N) leases
           (1) ──── (N) documents
           (1) ──── (N) maintenance_tickets

leases (1) ──── (N) documents
       (1) ──── (N) payments
```

---

## File Structure

```
nook-app/
├── app/                          # Next.js app directory
│   ├── (dashboard)/             # Dashboard layout group
│   │   ├── landlord/            # Landlord routes
│   │   ├── tenant/              # Tenant routes
│   │   ├── manager/             # Property manager routes
│   │   ├── admin/               # Admin routes
│   │   └── layout.tsx           # Dashboard layout wrapper
│   ├── auth/
│   │   └── callback/            # OAuth callback handler
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── role-select/             # Role selection (after email verification)
│   ├── super/                   # Superintendent routes
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── providers/
│   │   ├── auth-provider.tsx    # Auth context provider (★ KEY FILE)
│   │   └── ...
│   ├── auth/
│   │   ├── PremiumAuthForm.tsx  # Signup/login form (★ KEY FILE)
│   │   └── ...
│   ├── dashboard/               # Dashboard components
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase instance
│   │   ├── server.ts           # Server-side Supabase instance
│   │   └── ...
│   ├── types.ts                # TypeScript types (including UserRole)
│   ├── logger.ts               # Logging utility
│   └── ...
├── types/
│   └── supabase.ts             # Generated Supabase types
├── supabase/
│   └── migrations/             # Database migration files
├── guide/                       # Documentation (NEW)
│   ├── 01_supabase_restoration.md
│   ├── 02_setup_instructions.md
│   └── ...
├── .env.example                # Environment variables template
├── middleware.ts               # Next.js middleware (API route protection)
├── package.json
├── tsconfig.json
├── next.config.cjs
└── README.md
```

---

## Core Features

### 1. Authentication
- **Status**: ✅ Fixed
- **Files**: `auth-provider.tsx`, `auth/callback/route.ts`, `PremiumAuthForm.tsx`
- **Details**: Signup creates user in `public.users` table with role; login redirects to role-specific dashboard

### 2. Document Approval
- **Status**: In development
- **Files**: `components/document-*`, `/documents` pages
- **Flow**: Tenant uploads → Landlord reviews → Approve/Reject

### 3. Rent Payments
- **Status**: In development
- **Files**: `components/payment-*`, `/payments` pages, Stripe integration
- **Flow**: Tenant pays → Stripe processes → Payment confirmed

### 4. Maintenance Tickets
- **Status**: In development
- **Files**: `components/maintenance-*`, `/maintenance` pages
- **Flow**: Tenant creates ticket → Super/Manager assigned → Update status

### 5. Onboarding
- **Status**: In development
- **Files**: `/invite`, role-select, tenant-onboarding
- **Flow**: New user signs up → Selects role → Completes profile

---

## Recent Fixes

### Problem 1: Role-Based Redirects Broken
**Symptom**: After login, user always redirected to `/dashboard` instead of role-specific dashboard.

**Root Cause**: Auth callback and AuthProvider didn't properly handle role-to-path mapping.

**Fix Applied**:
1. Enhanced `app/auth/callback/route.ts` with `getRoleDashboardPath()` function
2. Added comprehensive logging for debugging
3. Added error handling for missing roles
4. Imported `getRoleDashboardPath()` into AuthProvider for consistency

**Files Modified**:
- `app/auth/callback/route.ts`
- `components/providers/auth-provider.tsx`

### Problem 2: Signup Doesn't Create `public.users` Entry
**Symptom**: User signs up successfully, but `public.users` table is empty; login fails with "user profile not found"

**Root Cause**: `supabase.auth.signUp()` creates auth account but doesn't create user profile entry.

**Fix Applied**:
1. Modified `PremiumAuthForm.tsx` to explicitly create user in `public.users` after auth signup
2. Added error handling if profile creation fails (user can still sign in but may be redirected to role-select)
3. Added comprehensive logging to track signup process

**Files Modified**:
- `components/auth/PremiumAuthForm.tsx`

### Problem 3: RLS Policies Preventing User Access
**Symptom**: "PGRST116" errors or 406 errors in console even after login.

**Temporary Solution**: AuthProvider now handles 406 errors gracefully. User can still access dashboard but may have limited data visibility.

**Permanent Solution Needed**: Review and fix RLS policies in Supabase (see Troubleshooting section).

---

## Known Issues & Workarounds

### Issue 1: RLS Policies Overly Restrictive
**Description**: Some RLS policies prevent users from viewing their own data.

**Workaround**: 
- AuthProvider catches these errors and doesn't throw
- Users redirected to onboarding if profile can't be fetched
- Review RLS policies in Supabase Dashboard → Settings → Authentication → Policies

**Permanent Fix**:
```sql
-- Example: Allow users to read their own profile
alter policy "Users view own profile" on users
  for select using (auth.uid() = id);
```

### Issue 2: Middleware Not Protecting API Routes
**Description**: API routes can be accessed without authentication.

**Workaround**: Manual auth checks in each API route handler.

**Permanent Fix**: Enhance middleware.ts to validate JWT tokens:
```typescript
// Check if route is protected
if (request.nextUrl.pathname.startsWith('/api/protected')) {
  const token = request.headers.get('authorization');
  if (!token) return NextResponse.redirect('/login');
}
```

### Issue 3: Email Confirmation Required but Not Enforced
**Description**: Signup doesn't require email confirmation in dev, but production may.

**Workaround**: Test with `SUPABASE_DISABLE_EMAIL_VERIFICATION=true` in development only.

**Permanent Fix**: Configure Supabase → Settings → Auth → Email to enforce/disable confirmation as needed.

---

## Development Workflow

### Setup for Development

```bash
# 1. Clone repo
git clone <repo-url>
cd nook-app

# 2. Install dependencies
npm install

# 3. Copy env template
cp .env.example .env.local

# 4. Update .env.local with YOUR Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 5. Start dev server
npm run dev
```

### Making Changes to Auth

When modifying authentication:

1. **AuthProvider changes** → Test login/logout in browser
2. **Auth callback changes** → Test email verification flow
3. **Signup form changes** → Test full signup + role selection
4. **RLS policy changes** → Test data access from each role

**Testing checklist**:
```bash
# Test auth flows
npm run test:e2e:auth

# Test specific role
npm run test:e2e:tenant
npm run test:e2e:landlord

# Manual test in browser
# - Sign up as tenant
# - Verify email
# - Log in
# - Check redirected to /dashboard/tenant
# - Check can view tenant features
```

### Debugging Auth Issues

**Enable detailed logging**:
1. Open browser DevTools (F12)
2. Filter console for "AuthProvider" messages
3. Look for 🔍 (searching), ✅ (success), ❌ (error) emojis

**Common debug messages**:
```
🔍 AuthProvider: Getting user...
✅ AuthProvider: Auth user found: user@example.com
🔍 AuthProvider: Fetching user profile...
✅ AuthProvider: User profile loaded
📍 AuthProvider: Redirecting to /dashboard/landlord
```

**Check database directly**:
1. Go to Supabase Dashboard → Table Editor
2. Click `users` table
3. Search for your test user's email
4. Verify `id`, `email`, `role` are correct

---

## Testing Strategy

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# Specific test file
npm run test:unit -- auth.test.ts
```

**Coverage target**: >80% for auth flows

### E2E Tests

```bash
# All tests
npm run test:e2e

# Role-specific tests
npm run test:e2e:tenant      # Tenant flows
npm run test:e2e:landlord    # Landlord flows
npm run test:e2e:admin       # Admin flows
npm run test:e2e:auth        # Auth flows (signup, login)

# Interactive mode
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

**Key E2E test scenarios**:
- Sign up with each role
- Email verification
- Login with invalid credentials
- Login with valid credentials
- Role-specific dashboard access
- Logout

### Manual Testing

Create test accounts for each role:

```
Tenant:  test-tenant@nook.app
Landlord: test-landlord@nook.app
Manager: test-manager@nook.app
Super:   test-super@nook.app
Admin:   test-admin@nook.app
```

Password: `Nook123!@#` (meets complexity requirements)

---

## Performance Considerations

### Database Queries

**Optimize AuthProvider user fetch**:
```typescript
// ❌ Fetches all columns (slow)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

// ✅ Fetches only needed columns (fast)
const { data } = await supabase
  .from('users')
  .select('id, email, first_name, last_name, role')
  .eq('id', user.id)
  .single();
```

### Caching

**Cache user profile in context**:
- Don't re-fetch on every render
- AuthProvider already does this via React Context
- Refresh only on auth state change

### API Routes

**Avoid N+1 queries**:
```typescript
// ❌ Bad: Fetches user for each property
for (const prop of properties) {
  const user = await supabase.from('users').select().eq('id', prop.landlord_id);
}

// ✅ Good: Single query with join
const { data } = await supabase
  .from('properties')
  .select('*, users(id, name)')
  .eq('users.id', landlord_id);
```

---

## Common Tasks

### Add a New Role

1. **Update database enum**:
   ```sql
   alter type user_role add value 'new_role';
   ```

2. **Update TypeScript type**:
   ```typescript
   // lib/types.ts
   export type UserRole = '...' | 'new_role';
   ```

3. **Update dashboard path mapping**:
   ```typescript
   // app/auth/callback/route.ts
   case 'new_role': return '/dashboard/new-role';
   ```

4. **Create new dashboard**:
   ```
   app/(dashboard)/new-role/
     ├── page.tsx
     ├── layout.tsx
     └── [...features]/
   ```

### Add a New Feature

1. Create feature components in `components/`
2. Create routes in `app/`
3. Add database tables if needed (with RLS)
4. Update RLS policies
5. Add E2E tests in `tests/e2e/`

### Deploy Changes

```bash
# 1. Test locally
npm run dev
npm run test:e2e

# 2. Build
npm run build

# 3. Deploy to Vercel (automatic on git push)
git add .
git commit -m "Fix auth redirects"
git push origin main
```

---

**Last Updated**: January 26, 2026  
**By**: Development Team  
**Next Review**: After Phase 4 (Stabilize core flows) completion
