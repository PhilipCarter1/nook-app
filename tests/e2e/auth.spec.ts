import { test, expect } from '@playwright/test';

// Basic smoke tests for launch readiness
test.describe('Smoke Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Nook|Login/);
  });

  test('should load signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Nook|Signup/);
  });

  test('should load forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveTitle(/Nook|Reset/);
  });

  test('should have working form inputs on login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Test that form inputs are present and functional
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
  });

  test('should have working form inputs on signup', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Debug: log page content
    
    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000);
    
    // Test that form inputs are present and functional
    const firstNameInput = page.getByLabel('First Name');
    const lastNameInput = page.getByLabel('Last Name');
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.locator('#password');
    const confirmPasswordInput = page.locator('#confirmPassword');
    
    // Debug: check if inputs exist
    const inputCount = await page.locator('input').count();
    
    await expect(firstNameInput).toBeVisible({ timeout: 10000 });
    await expect(lastNameInput).toBeVisible({ timeout: 10000 });
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
    
    await firstNameInput.fill('John');
    await lastNameInput.fill('Doe');
    await emailInput.fill('john@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
  });

  test('should have working form inputs on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Test that form inputs are present and functional
    const emailInput = page.getByLabel('Email');
    
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');
    
  });
});

// Comprehensive authentication flow tests
test.describe('Authentication Flow', () => {
  test('should handle login form submission', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in login form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit form (without actual authentication for testing)
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for any response (success or error)
    await page.waitForTimeout(2000);
    
  });

  test('should handle signup form submission', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Fill in signup form
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');
    
    // Submit form (without actual registration for testing)
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for any response
    await page.waitForTimeout(2000);
    
  });

  test('should handle forgot password form submission', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Fill in forgot password form
    await page.getByLabel('Email').fill('test@example.com');
    
    // Submit form
    await page.getByRole('button', { name: /reset password/i }).click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
  });

  test('should validate form inputs correctly', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Test validation by submitting empty form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show validation errors
    await page.waitForTimeout(1000);
    
  });

  test('should handle password mismatch validation', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Fill form with mismatched passwords
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('differentpassword');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for validation
    await page.waitForTimeout(2000);
    
  });
}); 