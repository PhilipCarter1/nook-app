import { test, expect } from '@playwright/test';

test.describe('End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Landing page navigation', async ({ page }) => {
    // Test navigation links
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a:has-text("Get started")', { state: 'visible' });
    await page.click('a:has-text("Get started")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*signup/);

    await page.goto('/');
    await page.waitForSelector('text=Log In');
    await page.click('text=Log In');
    await expect(page).toHaveURL(/.*login/);

    // Test feature tiles
    await page.goto('/');
    await page.waitForSelector('text=Learn more');
    await page.click('text=Learn more');
    await expect(page).toHaveURL(/.*features/);

    // Test footer links
    await page.waitForSelector('text=Privacy Policy');
    await page.click('text=Privacy Policy');
    await expect(page).toHaveURL(/.*privacy/);

    await page.waitForSelector('text=Terms of Service');
    await page.click('text=Terms of Service');
    await expect(page).toHaveURL(/.*terms/);

    await page.waitForSelector('text=Contact Us');
    await page.click('text=Contact Us');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('Tenant flow', async ({ page }) => {
    // Sign up as tenant
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'tenant@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click signup and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // Verify we're on the onboarding page
    await expect(page).toHaveURL(/.*onboarding/);
    await page.waitForLoadState('networkidle');
    
    // Complete onboarding
    await page.waitForSelector('input[name="name"]', { state: 'visible' });
    await page.fill('input[name="name"]', 'Test Tenant');
    await page.fill('input[name="email"]', 'tenant@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.click('button:has-text("Next")');

    // Add payment info
    await page.waitForSelector('input[name="bankName"]', { state: 'visible' });
    await page.fill('input[name="bankName"]', 'Test Bank');
    await page.fill('input[name="accountNumber"]', '1234567890');
    await page.fill('input[name="routingNumber"]', '987654321');
    await page.click('button:has-text("Complete")');

    // Verify dashboard access
    await expect(page).toHaveURL(/.*dashboard/);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Welcome', { state: 'visible' });
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Test maintenance request
    await page.waitForSelector('text=Maintenance', { state: 'visible' });
    await page.click('text=Maintenance');
    await page.waitForSelector('button:has-text("New Request")', { state: 'visible' });
    await page.click('button:has-text("New Request")');
    await page.waitForSelector('textarea[name="description"]', { state: 'visible' });
    await page.fill('textarea[name="description"]', 'Test maintenance request');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Request submitted successfully')).toBeVisible();

    // Test payment
    await page.waitForSelector('text=Payments', { state: 'visible' });
    await page.click('text=Payments');
    await page.waitForSelector('button:has-text("Make Payment")', { state: 'visible' });
    await page.click('button:has-text("Make Payment")');
    await page.waitForSelector('input[name="amount"]', { state: 'visible' });
    await page.fill('input[name="amount"]', '1000');
    await page.click('button:has-text("Continue")');
  });

  test('Landlord flow', async ({ page }) => {
    // Sign up as landlord
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'landlord@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click signup and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // Verify we're on the onboarding page
    await expect(page).toHaveURL(/.*onboarding/);
    await page.waitForLoadState('networkidle');
    
    // Complete onboarding
    await page.waitForSelector('input[name="name"]', { state: 'visible' });
    await page.fill('input[name="name"]', 'Test Landlord');
    await page.fill('input[name="email"]', 'landlord@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="companyName"]', 'Test Properties LLC');
    await page.selectOption('select[name="companyType"]', 'LLC');
    await page.fill('input[name="taxId"]', '123456789');
    await page.click('button:has-text("Next")');

    // Add property
    await page.waitForSelector('input[name="propertyName"]', { state: 'visible' });
    await page.fill('input[name="propertyName"]', 'Test Property');
    await page.fill('input[name="propertyAddress"]', '123 Test St');
    await page.selectOption('select[name="propertyType"]', 'Apartment');
    await page.fill('input[name="units"]', '10');
    await page.click('button:has-text("Next")');

    // Add payment info
    await page.waitForSelector('input[name="bankName"]', { state: 'visible' });
    await page.fill('input[name="bankName"]', 'Test Bank');
    await page.fill('input[name="accountNumber"]', '1234567890');
    await page.fill('input[name="routingNumber"]', '987654321');
    await page.click('button:has-text("Complete")');

    // Verify dashboard access
    await expect(page).toHaveURL(/.*dashboard/);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Welcome', { state: 'visible' });
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Test property management
    await page.waitForSelector('text=Properties', { state: 'visible' });
    await page.click('text=Properties');
    await expect(page.locator('text=Test Property')).toBeVisible();

    // Test tenant management
    await page.waitForSelector('text=Tenants', { state: 'visible' });
    await page.click('text=Tenants');
    await page.waitForSelector('button:has-text("Add Tenant")', { state: 'visible' });
    await page.click('button:has-text("Add Tenant")');
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    await page.fill('input[name="email"]', 'newtenant@example.com');
    await page.fill('input[name="name"]', 'New Tenant');
    await page.click('button:has-text("Add")');
    await expect(page.locator('text=New Tenant')).toBeVisible();
  });

  test('Admin flow', async ({ page }) => {
    // Sign in as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'admin@rentwithnook.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify dashboard access
    await expect(page).toHaveURL(/.*dashboard/);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Admin Dashboard', { state: 'visible' });
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();

    // Test user management
    await page.waitForSelector('text=Users', { state: 'visible' });
    await page.click('text=Users');
    await expect(page.locator('text=User Management')).toBeVisible();

    // Test feature toggles
    await page.waitForSelector('text=Settings', { state: 'visible' });
    await page.click('text=Settings');
    await page.waitForSelector('text=Feature Toggles', { state: 'visible' });
    await page.click('text=Feature Toggles');
    await expect(page.locator('text=Feature Management')).toBeVisible();

    // Test system settings
    await page.waitForSelector('text=System Settings', { state: 'visible' });
    await page.click('text=System Settings');
    await expect(page.locator('text=System Configuration')).toBeVisible();
  });

  test('Error handling', async ({ page }) => {
    // Test invalid login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();

    // Test form validation
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button[type="submit"]', { state: 'visible' });
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test 404 page
    await page.goto('/nonexistent');
    await expect(page.locator('text=Page not found')).toBeVisible();
  });
}); 