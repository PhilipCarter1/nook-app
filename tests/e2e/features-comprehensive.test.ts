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
  
  await page.waitForURL(/\/dashboard/);
  await page.waitForLoadState('networkidle');
}

// ===== PROPERTY MANAGEMENT FEATURE TESTS =====
test.describe('Property Management Feature Tests', () => {
  test.describe('Landlord Property Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should view property list', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await expect(page.locator('text=/property/i')).toBeVisible();
      await expect(page.locator('text=/Add New Property/i')).toBeVisible();
    });

    test('should add new property', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await page.getByRole('button', { name: /Add New Property/i }).click();
      
      // Fill property form
      await page.getByLabel('Property Name').fill('Test Property');
      await page.getByLabel('Address').fill('123 Test Street');
      await page.getByLabel('City').fill('Test City');
      await page.getByLabel('State').fill('Test State');
      await page.getByLabel('Zip Code').fill('12345');
      await page.getByLabel('Property Type').selectOption('apartment');
      
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.locator('text=/Property added successfully/i')).toBeVisible();
    });

    test('should edit existing property', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await page.getByRole('button', { name: /edit/i }).first().click();
      
      await page.getByLabel('Property Name').fill('Updated Property Name');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.locator('text=/Property updated successfully/i')).toBeVisible();
    });

    test('should delete property', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await page.getByRole('button', { name: /delete/i }).first().click();
      
      // Confirm deletion
      await page.getByRole('button', { name: /confirm/i }).click();
      
      await expect(page.locator('text=/Property deleted successfully/i')).toBeVisible();
    });

    test('should view property details', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await page.getByRole('link', { name: /view details/i }).first().click();
      
      await expect(page.locator('text=/Property Details/i')).toBeVisible();
      await expect(page.locator('text=/Tenants/i')).toBeVisible();
      await expect(page.locator('text=/Maintenance/i')).toBeVisible();
    });
  });

  test.describe('Tenant Property View', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should view assigned properties', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await expect(page.locator('text=/My Properties/i')).toBeVisible();
    });

    test('should view property details as tenant', async ({ page }) => {
      await page.goto('/dashboard/properties');
      await page.getByRole('link', { name: /view details/i }).first().click();
      
      await expect(page.locator('text=/Property Details/i')).toBeVisible();
      await expect(page.locator('text=/Submit Maintenance Request/i')).toBeVisible();
    });
  });
});

// ===== MAINTENANCE MANAGEMENT FEATURE TESTS =====
test.describe('Maintenance Management Feature Tests', () => {
  test.describe('Tenant Maintenance Requests', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should submit maintenance request', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await page.getByRole('button', { name: /Submit Request/i }).click();
      
      // Fill maintenance request form
      await page.getByLabel('Title').fill('Leaky Faucet');
      await page.getByLabel('Description').fill('Kitchen faucet is leaking');
      await page.getByLabel('Priority').selectOption('medium');
      await page.getByLabel('Property').selectOption('1');
      
      await page.getByRole('button', { name: /submit/i }).click();
      
      await expect(page.locator('text=/Request submitted successfully/i')).toBeVisible();
    });

    test('should view maintenance history', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await page.getByRole('tab', { name: /history/i }).click();
      
      await expect(page.locator('text=/Maintenance History/i')).toBeVisible();
    });

    test('should update maintenance request', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await page.getByRole('button', { name: /edit/i }).first().click();
      
      await page.getByLabel('Description').fill('Updated description');
      await page.getByRole('button', { name: /update/i }).click();
      
      await expect(page.locator('text=/Request updated successfully/i')).toBeVisible();
    });
  });

  test.describe('Landlord Maintenance Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should view all maintenance requests', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await expect(page.locator('text=/Maintenance Requests/i')).toBeVisible();
      await expect(page.locator('text=/Filter/i')).toBeVisible();
    });

    test('should assign maintenance to contractor', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await page.getByRole('button', { name: /assign/i }).first().click();
      
      await page.getByLabel('Contractor').selectOption('1');
      await page.getByLabel('Notes').fill('Please fix the leaky faucet');
      await page.getByRole('button', { name: /assign/i }).click();
      
      await expect(page.locator('text=/Assigned successfully/i')).toBeVisible();
    });

    test('should update maintenance status', async ({ page }) => {
      await page.goto('/dashboard/maintenance');
      await page.getByRole('button', { name: /update status/i }).first().click();
      
      await page.getByLabel('Status').selectOption('in_progress');
      await page.getByLabel('Notes').fill('Work in progress');
      await page.getByRole('button', { name: /update/i }).click();
      
      await expect(page.locator('text=/Status updated successfully/i')).toBeVisible();
    });
  });
});

// ===== PAYMENT MANAGEMENT FEATURE TESTS =====
test.describe('Payment Management Feature Tests', () => {
  test.describe('Tenant Payment Features', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should view payment history', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await expect(page.locator('text=/Payment History/i')).toBeVisible();
      await expect(page.locator('text=/Outstanding Balance/i')).toBeVisible();
    });

    test('should make payment', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await page.getByRole('button', { name: /Make Payment/i }).click();
      
      // Fill payment form
      await page.getByLabel('Amount').fill('1500');
      await page.getByLabel('Payment Method').selectOption('credit_card');
      await page.getByLabel('Card Number').fill('4111111111111111');
      await page.getByLabel('Expiry Date').fill('12/25');
      await page.getByLabel('CVV').fill('123');
      
      await page.getByRole('button', { name: /process payment/i }).click();
      
      await expect(page.locator('text=/Payment processed successfully/i')).toBeVisible();
    });

    test('should view payment receipts', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await page.getByRole('button', { name: /view receipt/i }).first().click();
      
      await expect(page.locator('text=/Payment Receipt/i')).toBeVisible();
    });
  });

  test.describe('Landlord Payment Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should view payment overview', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await expect(page.locator('text=/Payment Overview/i')).toBeVisible();
      await expect(page.locator('text=/Total Collected/i')).toBeVisible();
    });

    test('should generate payment reports', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await page.getByRole('button', { name: /Generate Report/i }).click();
      
      await page.getByLabel('Start Date').fill('2024-01-01');
      await page.getByLabel('End Date').fill('2024-12-31');
      await page.getByRole('button', { name: /generate/i }).click();
      
      await expect(page.locator('text=/Report Generated/i')).toBeVisible();
    });

    test('should send payment reminders', async ({ page }) => {
      await page.goto('/dashboard/payments');
      await page.getByRole('button', { name: /Send Reminders/i }).click();
      
      await page.getByLabel('Message').fill('Please submit your rent payment');
      await page.getByRole('button', { name: /send/i }).click();
      
      await expect(page.locator('text=/Reminders sent successfully/i')).toBeVisible();
    });
  });
});

// ===== DOCUMENT MANAGEMENT FEATURE TESTS =====
test.describe('Document Management Feature Tests', () => {
  test.describe('Document Upload and Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should upload document', async ({ page }) => {
      await page.goto('/dashboard/documents');
      await page.getByRole('button', { name: /Upload Document/i }).click();
      
      // Upload file
      await page.setInputFiles('input[type="file"]', {
        name: 'test-lease.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content')
      });
      
      await page.getByLabel('Document Type').selectOption('lease');
      await page.getByLabel('Description').fill('Test lease agreement');
      await page.getByRole('button', { name: /upload/i }).click();
      
      await expect(page.locator('text=/Document uploaded successfully/i')).toBeVisible();
    });

    test('should view document library', async ({ page }) => {
      await page.goto('/dashboard/documents');
      await expect(page.locator('text=/Document Library/i')).toBeVisible();
      await expect(page.locator('text=/Filter by Type/i')).toBeVisible();
    });

    test('should share document with tenant', async ({ page }) => {
      await page.goto('/dashboard/documents');
      await page.getByRole('button', { name: /share/i }).first().click();
      
      await page.getByLabel('Tenant').selectOption('1');
      await page.getByLabel('Message').fill('Please review this document');
      await page.getByRole('button', { name: /share/i }).click();
      
      await expect(page.locator('text=/Document shared successfully/i')).toBeVisible();
    });
  });

  test.describe('Tenant Document Access', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should view shared documents', async ({ page }) => {
      await page.goto('/dashboard/documents');
      await expect(page.locator('text=/Shared Documents/i')).toBeVisible();
    });

    test('should download document', async ({ page }) => {
      await page.goto('/dashboard/documents');
      await page.getByRole('button', { name: /download/i }).first().click();
      
      // Verify download started
    });
  });
});

// ===== MESSAGING SYSTEM FEATURE TESTS =====
test.describe('Messaging System Feature Tests', () => {
  test.describe('Message Composition and Sending', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should compose new message', async ({ page }) => {
      await page.goto('/dashboard/messages');
      await page.getByRole('button', { name: /New Message/i }).click();
      
      await page.getByLabel('To').selectOption('tenant@example.com');
      await page.getByLabel('Subject').fill('Important Notice');
      await page.getByLabel('Message').fill('Please be aware of upcoming maintenance');
      await page.getByRole('button', { name: /send/i }).click();
      
      await expect(page.locator('text=/Message sent successfully/i')).toBeVisible();
    });

    test('should view message inbox', async ({ page }) => {
      await page.goto('/dashboard/messages');
      await expect(page.locator('text=/Inbox/i')).toBeVisible();
      await expect(page.locator('text=/Sent/i')).toBeVisible();
    });

    test('should reply to message', async ({ page }) => {
      await page.goto('/dashboard/messages');
      await page.getByRole('button', { name: /reply/i }).first().click();
      
      await page.getByLabel('Message').fill('Thank you for the information');
      await page.getByRole('button', { name: /send/i }).click();
      
      await expect(page.locator('text=/Reply sent successfully/i')).toBeVisible();
    });
  });

  test.describe('Tenant Messaging', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should view received messages', async ({ page }) => {
      await page.goto('/dashboard/messages');
      await expect(page.locator('text=/Inbox/i')).toBeVisible();
    });

    test('should send message to landlord', async ({ page }) => {
      await page.goto('/dashboard/messages');
      await page.getByRole('button', { name: /New Message/i }).click();
      
      await page.getByLabel('To').selectOption('landlord@example.com');
      await page.getByLabel('Subject').fill('Maintenance Request');
      await page.getByLabel('Message').fill('I need help with a plumbing issue');
      await page.getByRole('button', { name: /send/i }).click();
      
      await expect(page.locator('text=/Message sent successfully/i')).toBeVisible();
    });
  });
});

// ===== ANALYTICS AND REPORTING FEATURE TESTS =====
test.describe('Analytics and Reporting Feature Tests', () => {
  test.describe('Landlord Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'landlord');
    });

    test('should view financial analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await expect(page.locator('text=/Financial Analytics/i')).toBeVisible();
      await expect(page.locator('text=/Revenue/i')).toBeVisible();
      await expect(page.locator('text=/Expenses/i')).toBeVisible();
    });

    test('should view property performance', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await page.getByRole('tab', { name: /Property Performance/i }).click();
      
      await expect(page.locator('text=/Property Performance/i')).toBeVisible();
      await expect(page.locator('text=/Occupancy Rate/i')).toBeVisible();
    });

    test('should generate custom reports', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await page.getByRole('button', { name: /Generate Report/i }).click();
      
      await page.getByLabel('Report Type').selectOption('financial');
      await page.getByLabel('Date Range').selectOption('last_year');
      await page.getByRole('button', { name: /generate/i }).click();
      
      await expect(page.locator('text=/Report Generated/i')).toBeVisible();
    });
  });

  test.describe('Admin Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin');
    });

    test('should view system-wide analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await expect(page.locator('text=/System Analytics/i')).toBeVisible();
      await expect(page.locator('text=/Total Users/i')).toBeVisible();
      await expect(page.locator('text=/Total Properties/i')).toBeVisible();
    });

    test('should view user activity reports', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await page.getByRole('tab', { name: /User Activity/i }).click();
      
      await expect(page.locator('text=/User Activity/i')).toBeVisible();
      await expect(page.locator('text=/Login History/i')).toBeVisible();
    });
  });
});

// ===== SETTINGS AND PROFILE FEATURE TESTS =====
test.describe('Settings and Profile Feature Tests', () => {
  test.describe('User Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'tenant');
    });

    test('should update profile information', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.getByRole('tab', { name: /Profile/i }).click();
      
      await page.getByLabel('Phone').fill('555-123-4567');
      await page.getByLabel('Address').fill('456 New Address');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.locator('text=/Profile updated successfully/i')).toBeVisible();
    });

    test('should change password', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.getByRole('tab', { name: /Security/i }).click();
      
      await page.getByLabel('Current Password').fill('password123');
      await page.getByLabel('New Password').fill('newpassword123');
      await page.getByLabel('Confirm New Password').fill('newpassword123');
      await page.getByRole('button', { name: /change password/i }).click();
      
      await expect(page.locator('text=/Password changed successfully/i')).toBeVisible();
    });

    test('should update notification preferences', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.getByRole('tab', { name: /Notifications/i }).click();
      
      await page.getByLabel('Email Notifications').check();
      await page.getByLabel('SMS Notifications').uncheck();
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.locator('text=/Preferences updated successfully/i')).toBeVisible();
    });
  });

  test.describe('System Settings (Admin)', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'admin');
    });

    test('should access system settings', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await expect(page.locator('text=/System Settings/i')).toBeVisible();
      await expect(page.locator('text=/General/i')).toBeVisible();
    });

    test('should manage user roles', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.getByRole('tab', { name: /User Management/i }).click();
      
      await expect(page.locator('text=/User Roles/i')).toBeVisible();
      await expect(page.locator('text=/Assign Roles/i')).toBeVisible();
    });
  });
}); 