# Running Tests & Quality Checks

This guide explains how to run tests locally and ensure code quality for Nook.

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run unit tests
npm run test:unit

# Run E2E tests  
npm run test:e2e

# Check for errors/lint issues
npm run lint

# Build for production
npm run build
```

---

## Unit Tests

Unit tests verify individual functions and components work correctly.

### Run Unit Tests

```bash
# Run once
npm run test:unit

# Watch mode (re-run on file change)
npm run test:unit:watch

# Coverage report
npm run test:unit -- --coverage
```

### Where Tests Live

```
__tests__/
├── unit/
│   ├── auth.test.ts          # Authentication logic
│   ├── roles.test.ts         # Role-based access
│   ├── validation.test.ts    # Form validation
│   └── ...
├── integration/
│   ├── supabase.test.ts      # Database queries
│   └── api-routes.test.ts
└── utils/
    └── test-helpers.ts
```

### Writing Tests

**Example: Auth Provider Test**

```typescript
// __tests__/unit/auth.test.ts
import { getRoleDashboardPath } from '@/app/auth/callback/route';

describe('getRoleDashboardPath', () => {
  it('should map tenant role to tenant dashboard', () => {
    expect(getRoleDashboardPath('tenant')).toBe('/dashboard/tenant');
  });
  
  it('should map landlord role to landlord dashboard', () => {
    expect(getRoleDashboardPath('landlord')).toBe('/dashboard/landlord');
  });
  
  it('should handle unknown roles', () => {
    expect(getRoleDashboardPath('unknown')).toBe('/dashboard');
  });
});
```

### Test Coverage Goals

| Module | Target | Current |
|--------|--------|---------|
| Auth flows | 90% | 70% |
| Database queries | 85% | 60% |
| Form validation | 95% | 80% |
| Utils | 80% | 75% |

---

## E2E (End-to-End) Tests

E2E tests verify complete user flows work from signup to feature usage.

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run role-specific tests
npm run test:e2e:tenant       # Tenant workflows
npm run test:e2e:landlord     # Landlord workflows
npm run test:e2e:admin        # Admin workflows
npm run test:e2e:super        # Super/Superintendent workflows

# Run specific feature tests
npm run test:e2e:auth         # Sign-up, login, logout
npm run test:e2e:features     # Core features (documents, payments, etc)
npm run test:e2e:ui-ux        # UI/UX tests

# Interactive UI (watch failures)
npm run test:e2e:ui

# View HTML report after running
npm run test:e2e:report
```

### Test Configuration

```
playwright.config.ts  # Playwright browser automation config
tests/
├── e2e/
│   ├── auth.spec.ts           # Auth workflows
│   ├── roles/
│   │   ├── tenant.spec.ts
│   │   ├── landlord.spec.ts
│   │   ├── admin.spec.ts
│   │   └── super.spec.ts
│   ├── features/
│   │   ├── documents.spec.ts
│   │   ├── payments.spec.ts
│   │   └── maintenance.spec.ts
│   └── helpers/
│       └── test-utils.ts
└── screenshots/           # Test failure screenshots
```

### E2E Test Examples

**Example: Tenant Sign-Up & Login**

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('tenant can sign up and log in', async ({ page }) => {
    // 1. Navigate to sign-up
    await page.goto('http://localhost:3000/signup');
    
    // 2. Fill sign-up form
    const email = `tenant-${Date.now()}@test.nook.app`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Tenant');
    
    // 3. Select tenant role
    await page.click('button:has-text("Tenant")');
    
    // 4. Submit form
    await page.click('button:has-text("Create Account")');
    
    // 5. Verify success message
    await expect(page.locator('text=Account created')).toBeVisible();
    
    // 6. Log in with new account
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button:has-text("Sign In")');
    
    // 7. Verify redirected to tenant dashboard
    await expect(page).toHaveURL('/dashboard/tenant');
    await expect(page.locator('text=Tenant Dashboard')).toBeVisible();
  });
});
```

### Common Test Patterns

**Check element visibility**:
```typescript
await expect(page.locator('button:has-text("Create")')).toBeVisible();
```

**Fill forms**:
```typescript
await page.fill('input[type="email"]', 'user@example.com');
await page.click('select[name="role"]');
await page.selectOption('select[name="role"]', 'tenant');
```

**Wait for navigation**:
```typescript
await page.click('button');
await page.waitForURL('/dashboard/**');
```

**Check console errors**:
```typescript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('Browser error:', msg.text());
  }
});
```

---

## Linting & Code Quality

### Run Linter

```bash
# Check for lint errors
npm run lint

# Fix automatic errors
npm run lint -- --fix
```

### ESLint Configuration

```
.eslintrc.json  # ESLint rules
```

**Common rules**:
- No unused variables
- No console.logs in production
- Proper TypeScript typing
- No empty blocks

### Pre-Commit Hooks

Husky automatically runs linter before commits:

```bash
# If lint check fails, commit is blocked
# Fix issues and try again
npm run lint -- --fix
git add .
git commit -m "Fix lint issues"
```

---

## Type Checking

### Check TypeScript Errors

```bash
# Check types without building
npx tsc --noEmit

# Check in watch mode
npx tsc --noEmit --watch
```

### Generate Supabase Types

```bash
# If schema changes, regenerate types
npm run db:types
```

---

## Build Verification

### Build for Production

```bash
# Build (catches type errors, optimizes)
npm run build

# If build succeeds, start production server
npm run start
```

### Common Build Issues

**Issue: "Cannot find module"**
```bash
npm install
npm run build
```

**Issue: "Type 'X' is not assignable to type 'Y'"**
- Fix TypeScript errors in IDE
- Check `tsconfig.json`

**Issue: "Unexpected token"**
- Check for syntax errors
- Verify all files are valid JavaScript/TypeScript

---

## Test Data Setup

### Create Test Users

Create these test accounts for manual testing:

```
Email: test-tenant@nook.app
Password: TestPass123!
Role: Tenant

Email: test-landlord@nook.app
Password: TestPass123!
Role: Landlord

Email: test-admin@nook.app
Password: TestPass123!
Role: Admin
```

**How to create**:
1. Run `npm run dev`
2. Visit `http://localhost:3000/signup`
3. Fill form and submit
4. Verify email (check Supabase dashboard)
5. Log in with credentials

### Reset Test Data

```bash
# Delete test users from Supabase
# Go to: Supabase Dashboard → SQL Editor
# Run:

DELETE FROM users WHERE email LIKE '%test%';
DELETE FROM auth.users WHERE email LIKE '%test%';
```

---

## CI/CD Pipeline

### GitHub Actions

Tests run automatically on every push:

```
.github/workflows/
├── tests.yml          # Runs lint + unit tests
└── deploy.yml         # Builds + deploys to Vercel
```

**View results**: Go to GitHub → Pull Request → Checks

### Local Simulation

To run the same tests as CI locally:

```bash
# Run everything CI runs
npm run lint
npm run build
npm run test:unit
npm run test:e2e
```

---

## Debugging Failed Tests

### Unit Test Failures

```bash
# Run single test file
npm run test:unit -- auth.test.ts

# Run with verbose output
npm run test:unit -- --reporter=verbose

# Debug in Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

### E2E Test Failures

**View failure screenshot**:
```bash
npm run test:e2e
# Look in: playwright-report/failure-screenshots/
```

**Run in debug mode**:
```bash
npm run test:e2e:debug
# Pause on each action, inspect DOM
```

**Slow motion (easier to watch)**:
```bash
PWDEBUG=1 npm run test:e2e
```

### Check Logs

```
test-results/       # Test reports
playwright-report/  # Detailed HTML report
```

---

## Performance Testing

### Measure Page Load Time

```typescript
// tests/e2e/performance.spec.ts
test('homepage loads in < 3s', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:3000');
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(3000);
});
```

### Check Core Web Vitals

```bash
# Install Lighthouse
npm install -g lighthouse

# Test production URL
lighthouse https://nook-app.vercel.app --view
```

---

## Continuous Integration Checklist

Before pushing code, verify:

- ✅ `npm run lint` passes
- ✅ `npm run build` succeeds
- ✅ `npm run test:unit` passes
- ✅ `npm run test:e2e` passes (or planned)
- ✅ No console errors in dev server
- ✅ No TypeScript errors

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Run dev server | `npm run dev` |
| Run all tests | `npm test` |
| Unit tests only | `npm run test:unit` |
| E2E tests only | `npm run test:e2e` |
| Linting | `npm run lint` |
| Fix lint | `npm run lint -- --fix` |
| Build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| View E2E report | `npm run test:e2e:report` |

---

**Last Updated**: January 26, 2026
