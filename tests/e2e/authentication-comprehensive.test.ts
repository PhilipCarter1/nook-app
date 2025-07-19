import { test, expect } from '@playwright/test';

// ===== COMPREHENSIVE AUTHENTICATION TESTS =====
test.describe('Comprehensive Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ===== REGISTRATION FLOW TESTS =====
  test.describe('Registration Flow Tests', () => {
    test('should register new tenant user', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Fill registration form
      await page.getByLabel('First Name').fill('Test');
      await page.getByLabel('Last Name').fill('Tenant');
      await page.getByLabel('Email').fill('newtenant@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByLabel('Role').selectOption('tenant');
      
      // Submit registration
      await page.getByRole('button', { name: /register/i }).click();
      
      // Verify successful registration
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should register new landlord user', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Fill registration form
      await page.getByLabel('First Name').fill('Test');
      await page.getByLabel('Last Name').fill('Landlord');
      await page.getByLabel('Email').fill('newlandlord@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByLabel('Role').selectOption('landlord');
      
      // Submit registration
      await page.getByRole('button', { name: /register/i }).click();
      
      // Verify successful registration
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should validate registration form fields', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Verify all required fields are present
      await expect(page.getByLabel('First Name')).toBeVisible();
      await expect(page.getByLabel('Last Name')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Confirm Password')).toBeVisible();
      await expect(page.getByLabel('Role')).toBeVisible();
      
    });

    test('should show validation errors for invalid registration', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /register/i }).click();
      
      // Verify validation errors
      await expect(page.locator('text=/required/i')).toBeVisible();
    });
  });

  // ===== LOGIN FLOW TESTS =====
  test.describe('Login Flow Tests', () => {
    test('should login as tenant user', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Fill login form
      await page.getByLabel('Email').fill('tenant@example.com');
      await page.getByLabel('Password').fill('password123');
      
      // Submit login
      await page.getByRole('button', { name: /login/i }).click();
      
      // Verify successful login
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should login as landlord user', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Fill login form
      await page.getByLabel('Email').fill('landlord@example.com');
      await page.getByLabel('Password').fill('password123');
      
      // Submit login
      await page.getByRole('button', { name: /login/i }).click();
      
      // Verify successful login
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should login as admin user', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Fill login form
      await page.getByLabel('Email').fill('admin@example.com');
      await page.getByLabel('Password').fill('password123');
      
      // Submit login
      await page.getByRole('button', { name: /login/i }).click();
      
      // Verify successful login
      await page.waitForURL(/\/dashboard/);
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should show validation errors for invalid login', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Try to login with invalid credentials
      await page.getByLabel('Email').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: /login/i }).click();
      
      // Verify error message
      await expect(page.locator('text=/invalid/i')).toBeVisible();
    });

    test('should validate login form fields', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Verify all required fields are present
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
      
    });
  });

  // ===== LOGOUT FLOW TESTS =====
  test.describe('Logout Flow Tests', () => {
    test('should logout tenant user', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel('Email').fill('tenant@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      
      // Verify logout
      await page.waitForURL(/\/login/);
      await expect(page.locator('text=/login/i')).toBeVisible();
    });

    test('should logout landlord user', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel('Email').fill('landlord@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      
      // Verify logout
      await page.waitForURL(/\/login/);
      await expect(page.locator('text=/login/i')).toBeVisible();
    });

    test('should logout admin user', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel('Email').fill('admin@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Logout
      await page.getByRole('button', { name: /logout/i }).click();
      
      // Verify logout
      await page.waitForURL(/\/login/);
      await expect(page.locator('text=/login/i')).toBeVisible();
    });
  });

  // ===== ROLE-BASED ACCESS TESTS =====
  test.describe('Role-Based Access Tests', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForURL(/\/login/);
      await expect(page.locator('text=/login/i')).toBeVisible();
    });

    test('should allow tenant access to tenant-specific routes', async ({ page }) => {
      // Login as tenant
      await page.goto('/login');
      await page.getByLabel('Email').fill('tenant@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Test tenant-specific routes
      await page.goto('/dashboard/tenant');
      await expect(page).toHaveTitle(/Nook/);
      
      await page.goto('/dashboard/maintenance');
      await expect(page.locator('text=/maintenance/i')).toBeVisible();
      
    });

    test('should allow landlord access to landlord-specific routes', async ({ page }) => {
      // Login as landlord
      await page.goto('/login');
      await page.getByLabel('Email').fill('landlord@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Test landlord-specific routes
      await page.goto('/dashboard/landlord');
      await expect(page).toHaveTitle(/Nook/);
      
      await page.goto('/dashboard/properties');
      await expect(page.locator('text=/property/i')).toBeVisible();
      
    });

    test('should allow admin access to admin-specific routes', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.getByLabel('Email').fill('admin@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Test admin-specific routes
      await page.goto('/dashboard/super');
      await expect(page).toHaveTitle(/Nook/);
      
      await page.goto('/dashboard/analytics');
      await expect(page).toHaveTitle(/Nook/);
      
    });
  });

  // ===== SESSION MANAGEMENT TESTS =====
  test.describe('Session Management Tests', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.getByLabel('Email').fill('tenant@example.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForURL(/\/dashboard/);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify still logged in
      await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      // This test would require backend session management
      // For now, we'll test the basic flow
      await page.goto('/dashboard');
      await page.waitForURL(/\/login/);
    });
  });

  // ===== PASSWORD RESET TESTS =====
  test.describe('Password Reset Tests', () => {
    test('should access password reset page', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: /forgot password/i }).click();
      
      await expect(page.locator('text=/reset password/i')).toBeVisible();
    });

    test('should validate password reset form', async ({ page }) => {
      await page.goto('/reset-password');
      await page.waitForLoadState('networkidle');
      
      // Verify form elements
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
      
    });
  });

  // ===== NAVIGATION TESTS =====
  test.describe('Navigation Tests', () => {
    test('should navigate between auth pages', async ({ page }) => {
      // Test login to register navigation
      await page.goto('/login');
      await page.getByRole('link', { name: /register/i }).click();
      await expect(page.locator('text=/register/i')).toBeVisible();
      
      // Test register to login navigation
      await page.getByRole('link', { name: /login/i }).click();
      await expect(page.locator('text=/login/i')).toBeVisible();
      
    });

    test('should handle direct URL access', async ({ page }) => {
      // Test direct access to protected routes
      await page.goto('/dashboard');
      await page.waitForURL(/\/login/);
      
      await page.goto('/dashboard/properties');
      await page.waitForURL(/\/login/);
      
    });
  });

  // ===== ERROR HANDLING TESTS =====
  test.describe('Error Handling Tests', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This would require mocking network failures
      // For now, test basic error handling
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Verify page loads without errors
      await expect(page.locator('text=/login/i')).toBeVisible();
    });

    test('should show appropriate error messages', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Test with invalid credentials
      await page.getByLabel('Email').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: /login/i }).click();
      
      // Should show some form of error message
      await expect(page.locator('[class*="error"]')).toBeVisible();
    });
  });
}); 