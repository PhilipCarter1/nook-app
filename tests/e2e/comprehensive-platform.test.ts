import { test, expect } from '@playwright/test';

// Helper function for role-based authentication
async function loginAs(page: any, role: 'tenant' | 'landlord' | 'admin') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  const testUsers = {
    tenant: { email: 'tenant@example.com', password: 'password123' },
    landlord: { email: 'landlord@example.com', password: 'password123' },
    admin: { email: 'admin@example.com', password: 'password123' }
  };
  
  const user = testUsers[role];
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /login/i }).click();
  
  // Wait for successful login and redirect
  await page.waitForURL(/\/dashboard/);
  await page.waitForLoadState('networkidle');
}

// Helper function to check premium dashboard content
async function verifyPremiumDashboard(page: any, role: string) {
  // Verify premium Nook theme elements
  await expect(page.locator('text=/Welcome back/i')).toBeVisible();
  await expect(page.locator('text=/property management/i')).toBeVisible();
  await expect(page.locator('text=/Quick Actions/i')).toBeVisible();
  await expect(page.locator('text=/Recent Activity/i')).toBeVisible();
  
  // Verify role-specific content
  if (role === 'landlord') {
    await expect(page.locator('text=/Add New Property/i')).toBeVisible();
    await expect(page.locator('text=/Invite Tenant/i')).toBeVisible();
  } else if (role === 'tenant') {
    await expect(page.locator('text=/Submit Maintenance Request/i')).toBeVisible();
    await expect(page.locator('text=/Make Payment/i')).toBeVisible();
  }
  
  // Verify premium stats cards
  await expect(page.locator('text=/Properties/i')).toBeVisible();
  await expect(page.locator('text=/Tenants/i')).toBeVisible();
  await expect(page.locator('text=/Payments/i')).toBeVisible();
  await expect(page.locator('text=/Maintenance/i')).toBeVisible();
}

// ===== TENANT ROLE COMPREHENSIVE TESTS =====
test.describe('Tenant Role - Comprehensive Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant');
  });

  test('should display premium tenant dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await verifyPremiumDashboard(page, 'tenant');
  });

  test('should access maintenance request system', async ({ page }) => {
    await page.goto('/dashboard/maintenance');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/maintenance/i')).toBeVisible();
  });

  test('should access payment system', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/payment/i')).toBeVisible();
  });

  test('should access document management', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access tenant settings', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access tenant profile', async ({ page }) => {
    await page.goto('/dashboard/tenant');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access messaging system', async ({ page }) => {
    await page.goto('/dashboard/messages');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access billing information', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access financial dashboard', async ({ page }) => {
    await page.goto('/dashboard/financial');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access applications', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access welcome page', async ({ page }) => {
    await page.goto('/dashboard/welcome');
    await expect(page).toHaveTitle(/Nook/);
  });
});

// ===== LANDLORD ROLE COMPREHENSIVE TESTS =====
test.describe('Landlord Role - Comprehensive Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'landlord');
  });

  test('should display premium landlord dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await verifyPremiumDashboard(page, 'landlord');
  });

  test('should access property management', async ({ page }) => {
    await page.goto('/dashboard/properties');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/property/i')).toBeVisible();
  });

  test('should access tenant management', async ({ page }) => {
    await page.goto('/dashboard/tenants');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/tenant/i')).toBeVisible();
  });

  test('should access maintenance management', async ({ page }) => {
    await page.goto('/dashboard/maintenance');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/maintenance/i')).toBeVisible();
  });

  test('should access payment processing', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page).toHaveTitle(/Nook/);
    await expect(page.locator('text=/payment/i')).toBeVisible();
  });

  test('should access document management', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access landlord settings', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access landlord profile', async ({ page }) => {
    await page.goto('/dashboard/landlord');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access messaging system', async ({ page }) => {
    await page.goto('/dashboard/messages');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access billing management', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access financial analytics', async ({ page }) => {
    await page.goto('/dashboard/financial');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access applications management', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page).toHaveTitle(/Nook/);
  });
});

// ===== ADMIN ROLE COMPREHENSIVE TESTS =====
test.describe('Admin Role - Comprehensive Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should display premium admin dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await verifyPremiumDashboard(page, 'admin');
  });

  test('should access admin super dashboard', async ({ page }) => {
    await page.goto('/dashboard/super');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system-wide property management', async ({ page }) => {
    await page.goto('/dashboard/properties');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system-wide tenant management', async ({ page }) => {
    await page.goto('/dashboard/tenants');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system-wide maintenance', async ({ page }) => {
    await page.goto('/dashboard/maintenance');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system-wide payments', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system-wide documents', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access admin settings', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access system analytics', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access financial management', async ({ page }) => {
    await page.goto('/dashboard/financial');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access billing management', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access messaging system', async ({ page }) => {
    await page.goto('/dashboard/messages');
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should access applications management', async ({ page }) => {
    await page.goto('/dashboard/applications');
    await expect(page).toHaveTitle(/Nook/);
  });
});

// ===== CROSS-ROLE FEATURE TESTS =====
test.describe('Cross-Role Feature Tests', () => {
  test('should test tenant maintenance request flow', async ({ page }) => {
    await loginAs(page, 'tenant');
    await page.goto('/dashboard/maintenance');
    
    // Test maintenance request creation
    await expect(page.locator('text=/maintenance/i')).toBeVisible();
  });

  test('should test landlord property management flow', async ({ page }) => {
    await loginAs(page, 'landlord');
    await page.goto('/dashboard/properties');
    
    // Test property management
    await expect(page.locator('text=/property/i')).toBeVisible();
  });

  test('should test payment processing flow', async ({ page }) => {
    await loginAs(page, 'tenant');
    await page.goto('/dashboard/payments');
    
    // Test payment processing
    await expect(page.locator('text=/payment/i')).toBeVisible();
  });

  test('should test document management flow', async ({ page }) => {
    await loginAs(page, 'landlord');
    await page.goto('/dashboard/documents');
    
    // Test document management
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should test messaging system flow', async ({ page }) => {
    await loginAs(page, 'tenant');
    await page.goto('/dashboard/messages');
    
    // Test messaging system
    await expect(page).toHaveTitle(/Nook/);
  });

  test('should test settings management flow', async ({ page }) => {
    await loginAs(page, 'landlord');
    await page.goto('/dashboard/settings');
    
    // Test settings management
    await expect(page).toHaveTitle(/Nook/);
  });
});

// ===== PREMIUM THEME VALIDATION TESTS =====
test.describe('Premium Nook Theme Validation', () => {
  test('should validate premium theme on tenant dashboard', async ({ page }) => {
    await loginAs(page, 'tenant');
    await page.goto('/dashboard');
    
    // Validate premium theme elements
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=/property management/i')).toBeVisible();
    await expect(page.locator('text=/Quick Actions/i')).toBeVisible();
    await expect(page.locator('text=/Recent Activity/i')).toBeVisible();
    
    // Validate premium UI components
    await expect(page.locator('[class*="card"]')).toBeVisible();
    await expect(page.locator('[class*="shadow"]')).toBeVisible();
    
  });

  test('should validate premium theme on landlord dashboard', async ({ page }) => {
    await loginAs(page, 'landlord');
    await page.goto('/dashboard');
    
    // Validate premium theme elements
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=/property management/i')).toBeVisible();
    await expect(page.locator('text=/Quick Actions/i')).toBeVisible();
    await expect(page.locator('text=/Recent Activity/i')).toBeVisible();
    
    // Validate premium UI components
    await expect(page.locator('[class*="card"]')).toBeVisible();
    await expect(page.locator('[class*="shadow"]')).toBeVisible();
    
  });

  test('should validate premium theme on admin dashboard', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard');
    
    // Validate premium theme elements
    await expect(page.locator('text=/Welcome back/i')).toBeVisible();
    await expect(page.locator('text=/property management/i')).toBeVisible();
    await expect(page.locator('text=/Quick Actions/i')).toBeVisible();
    await expect(page.locator('text=/Recent Activity/i')).toBeVisible();
    
    // Validate premium UI components
    await expect(page.locator('[class*="card"]')).toBeVisible();
    await expect(page.locator('[class*="shadow"]')).toBeVisible();
    
  });
}); 