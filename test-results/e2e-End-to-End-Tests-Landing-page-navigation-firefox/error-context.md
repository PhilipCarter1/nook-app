# Test info

- Name: End-to-End Tests >> Landing page navigation
- Location: /Users/philipcarter/Documents/nook-app/__tests__/e2e.test.tsx:8:7

# Error details

```
Error: page.goto: NS_BINDING_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /Users/philipcarter/Documents/nook-app/__tests__/e2e.test.tsx:16:16
```

# Page snapshot

```yaml
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('End-to-End Tests', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/');
   6 |   });
   7 |
   8 |   test('Landing page navigation', async ({ page }) => {
   9 |     // Test navigation links
   10 |     await page.waitForLoadState('networkidle');
   11 |     await page.waitForSelector('a:has-text("Get started")', { state: 'visible' });
   12 |     await page.click('a:has-text("Get started")');
   13 |     await page.waitForLoadState('networkidle');
   14 |     await expect(page).toHaveURL(/.*signup/);
   15 |
>  16 |     await page.goto('/');
      |                ^ Error: page.goto: NS_BINDING_ABORTED; maybe frame was detached?
   17 |     await page.waitForSelector('text=Log In');
   18 |     await page.click('text=Log In');
   19 |     await expect(page).toHaveURL(/.*login/);
   20 |
   21 |     // Test feature tiles
   22 |     await page.goto('/');
   23 |     await page.waitForSelector('text=Learn more');
   24 |     await page.click('text=Learn more');
   25 |     await expect(page).toHaveURL(/.*features/);
   26 |
   27 |     // Test footer links
   28 |     await page.waitForSelector('text=Privacy Policy');
   29 |     await page.click('text=Privacy Policy');
   30 |     await expect(page).toHaveURL(/.*privacy/);
   31 |
   32 |     await page.waitForSelector('text=Terms of Service');
   33 |     await page.click('text=Terms of Service');
   34 |     await expect(page).toHaveURL(/.*terms/);
   35 |
   36 |     await page.waitForSelector('text=Contact Us');
   37 |     await page.click('text=Contact Us');
   38 |     await expect(page).toHaveURL(/.*contact/);
   39 |   });
   40 |
   41 |   test('Tenant flow', async ({ page }) => {
   42 |     // Sign up as tenant
   43 |     await page.goto('/signup');
   44 |     await page.waitForLoadState('networkidle');
   45 |     await page.waitForSelector('input[type="email"]', { state: 'visible' });
   46 |     await page.fill('input[type="email"]', 'tenant@example.com');
   47 |     await page.fill('input[type="password"]', 'password123');
   48 |     
   49 |     // Click signup and wait for navigation
   50 |     await Promise.all([
   51 |       page.waitForNavigation({ waitUntil: 'networkidle' }),
   52 |       page.click('button[type="submit"]')
   53 |     ]);
   54 |
   55 |     // Verify we're on the onboarding page
   56 |     await expect(page).toHaveURL(/.*onboarding/);
   57 |     await page.waitForLoadState('networkidle');
   58 |     
   59 |     // Complete onboarding
   60 |     await page.waitForSelector('input[name="name"]', { state: 'visible' });
   61 |     await page.fill('input[name="name"]', 'Test Tenant');
   62 |     await page.fill('input[name="email"]', 'tenant@example.com');
   63 |     await page.fill('input[name="phone"]', '1234567890');
   64 |     await page.click('button:has-text("Next")');
   65 |
   66 |     // Add payment info
   67 |     await page.waitForSelector('input[name="bankName"]', { state: 'visible' });
   68 |     await page.fill('input[name="bankName"]', 'Test Bank');
   69 |     await page.fill('input[name="accountNumber"]', '1234567890');
   70 |     await page.fill('input[name="routingNumber"]', '987654321');
   71 |     await page.click('button:has-text("Complete")');
   72 |
   73 |     // Verify dashboard access
   74 |     await expect(page).toHaveURL(/.*dashboard/);
   75 |     await page.waitForLoadState('networkidle');
   76 |     await page.waitForSelector('text=Welcome', { state: 'visible' });
   77 |     await expect(page.locator('text=Welcome')).toBeVisible();
   78 |
   79 |     // Test maintenance request
   80 |     await page.waitForSelector('text=Maintenance', { state: 'visible' });
   81 |     await page.click('text=Maintenance');
   82 |     await page.waitForSelector('button:has-text("New Request")', { state: 'visible' });
   83 |     await page.click('button:has-text("New Request")');
   84 |     await page.waitForSelector('textarea[name="description"]', { state: 'visible' });
   85 |     await page.fill('textarea[name="description"]', 'Test maintenance request');
   86 |     await page.click('button:has-text("Submit")');
   87 |     await expect(page.locator('text=Request submitted successfully')).toBeVisible();
   88 |
   89 |     // Test payment
   90 |     await page.waitForSelector('text=Payments', { state: 'visible' });
   91 |     await page.click('text=Payments');
   92 |     await page.waitForSelector('button:has-text("Make Payment")', { state: 'visible' });
   93 |     await page.click('button:has-text("Make Payment")');
   94 |     await page.waitForSelector('input[name="amount"]', { state: 'visible' });
   95 |     await page.fill('input[name="amount"]', '1000');
   96 |     await page.click('button:has-text("Continue")');
   97 |   });
   98 |
   99 |   test('Landlord flow', async ({ page }) => {
  100 |     // Sign up as landlord
  101 |     await page.goto('/signup');
  102 |     await page.waitForLoadState('networkidle');
  103 |     await page.waitForSelector('input[type="email"]', { state: 'visible' });
  104 |     await page.fill('input[type="email"]', 'landlord@example.com');
  105 |     await page.fill('input[type="password"]', 'password123');
  106 |     
  107 |     // Click signup and wait for navigation
  108 |     await Promise.all([
  109 |       page.waitForNavigation({ waitUntil: 'networkidle' }),
  110 |       page.click('button[type="submit"]')
  111 |     ]);
  112 |
  113 |     // Verify we're on the onboarding page
  114 |     await expect(page).toHaveURL(/.*onboarding/);
  115 |     await page.waitForLoadState('networkidle');
  116 |     
```