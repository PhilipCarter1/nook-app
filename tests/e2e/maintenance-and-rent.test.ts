import { test, expect } from '@playwright/test';

// Test data
const TEST_PROPERTY = {
  name: 'Test Property',
  address: '123 Test St',
  rent: 2000,
};

const TEST_TENANT = {
  email: 'tenant@test.com',
  password: 'test123',
};

const TEST_LANDLORD = {
  email: 'landlord@test.com',
  password: 'test123',
};

test.describe('Maintenance and Rent Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test.describe('Tenant Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login as tenant
      await page.fill('input[type="email"]', TEST_TENANT.email);
      await page.fill('input[type="password"]', TEST_TENANT.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should submit maintenance request with media', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1');
      
      // Click on maintenance tab
      await page.click('text=Maintenance');
      
      // Click new maintenance request
      await page.click('button:has-text("New Request")');
      
      // Fill maintenance form
      await page.fill('input[name="title"]', 'Test Maintenance Request');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'high');
      
      // Upload test image
      const fileInput = await page.$('input[type="file"]');
      await fileInput?.setInputFiles('tests/fixtures/test-image.jpg');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Verify success message
      await expect(page.locator('text=Maintenance request submitted successfully')).toBeVisible();
    });

    test('should create and manage rent split', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1');
      
      // Click on rent tab
      await page.click('text=Rent');
      
      // Click split rent
      await page.click('button:has-text("Split Rent")');
      
      // Add new tenant to split
      await page.fill('input[name="email"]', 'newtenant@test.com');
      await page.fill('input[name="share"]', '50');
      await page.click('button:has-text("Add Tenant")');
      
      // Verify tenant added
      await expect(page.locator('text=newtenant@test.com')).toBeVisible();
      await expect(page.locator('text=50%')).toBeVisible();
    });

    test('should make rent payment', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1');
      
      // Click on rent tab
      await page.click('text=Rent');
      
      // Click pay rent
      await page.click('button:has-text("Pay Rent")');
      
      // Fill payment form
      await page.fill('input[name="amount"]', '1000');
      await page.fill('input[name="cardNumber"]', '4242424242424242');
      await page.fill('input[name="expiry"]', '12/25');
      await page.fill('input[name="cvc"]', '123');
      
      // Submit payment
      await page.click('button[type="submit"]');
      
      // Verify success message
      await expect(page.locator('text=Payment successful')).toBeVisible();
    });
  });

  test.describe('Landlord Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login as landlord
      await page.fill('input[type="email"]', TEST_LANDLORD.email);
      await page.fill('input[type="password"]', TEST_LANDLORD.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should manage maintenance requests', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1/manage');
      
      // Click on maintenance tab
      await page.click('text=Maintenance');
      
      // Verify maintenance request is visible
      await expect(page.locator('text=Test Maintenance Request')).toBeVisible();
      
      // Update status
      await page.selectOption('select[name="status"]', 'in_progress');
      await page.click('button:has-text("Update Status")');
      
      // Verify status updated
      await expect(page.locator('text=In Progress')).toBeVisible();
    });

    test('should generate rent report', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1/manage');
      
      // Click on rent tab
      await page.click('text=Rent');
      
      // Click generate report
      await page.click('button:has-text("Generate Report")');
      
      // Select month
      await page.selectOption('select[name="month"]', '2024-03');
      
      // Click download
      await page.click('button:has-text("Download")');
      
      // Verify download started
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('rent-report');
    });

    test('should manage rent splits', async ({ page }) => {
      // Navigate to property
      await page.goto('/dashboard/properties/1/manage');
      
      // Click on rent tab
      await page.click('text=Rent');
      
      // Click manage splits
      await page.click('button:has-text("Manage Splits")');
      
      // Verify split details
      await expect(page.locator('text=50%')).toBeVisible();
      await expect(page.locator('text=newtenant@test.com')).toBeVisible();
      
      // Update split
      await page.fill('input[name="share"]', '60');
      await page.click('button:has-text("Update Split")');
      
      // Verify update
      await expect(page.locator('text=60%')).toBeVisible();
    });
  });
}); 