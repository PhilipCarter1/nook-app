# Test info

- Name: End-to-End Tests >> Admin flow
- Location: /Users/philipcarter/Documents/nook-app/__tests__/e2e.test.tsx:165:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en" class="light">…</html>
      - unexpected value "http://localhost:3000/login"

    at /Users/philipcarter/Documents/nook-app/__tests__/e2e.test.tsx:175:24
```

# Page snapshot

```yaml
- heading "Welcome Back" [level=3]
- text: Email
- textbox "Email": admin@rentwithnook.com
- text: Password
- textbox "Password": admin123
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - link "Sign up":
    - /url: /signup
- alert
```

# Test source

```ts
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
  117 |     // Complete onboarding
  118 |     await page.waitForSelector('input[name="name"]', { state: 'visible' });
  119 |     await page.fill('input[name="name"]', 'Test Landlord');
  120 |     await page.fill('input[name="email"]', 'landlord@example.com');
  121 |     await page.fill('input[name="phone"]', '1234567890');
  122 |     await page.fill('input[name="companyName"]', 'Test Properties LLC');
  123 |     await page.selectOption('select[name="companyType"]', 'LLC');
  124 |     await page.fill('input[name="taxId"]', '123456789');
  125 |     await page.click('button:has-text("Next")');
  126 |
  127 |     // Add property
  128 |     await page.waitForSelector('input[name="propertyName"]', { state: 'visible' });
  129 |     await page.fill('input[name="propertyName"]', 'Test Property');
  130 |     await page.fill('input[name="propertyAddress"]', '123 Test St');
  131 |     await page.selectOption('select[name="propertyType"]', 'Apartment');
  132 |     await page.fill('input[name="units"]', '10');
  133 |     await page.click('button:has-text("Next")');
  134 |
  135 |     // Add payment info
  136 |     await page.waitForSelector('input[name="bankName"]', { state: 'visible' });
  137 |     await page.fill('input[name="bankName"]', 'Test Bank');
  138 |     await page.fill('input[name="accountNumber"]', '1234567890');
  139 |     await page.fill('input[name="routingNumber"]', '987654321');
  140 |     await page.click('button:has-text("Complete")');
  141 |
  142 |     // Verify dashboard access
  143 |     await expect(page).toHaveURL(/.*dashboard/);
  144 |     await page.waitForLoadState('networkidle');
  145 |     await page.waitForSelector('text=Welcome', { state: 'visible' });
  146 |     await expect(page.locator('text=Welcome')).toBeVisible();
  147 |
  148 |     // Test property management
  149 |     await page.waitForSelector('text=Properties', { state: 'visible' });
  150 |     await page.click('text=Properties');
  151 |     await expect(page.locator('text=Test Property')).toBeVisible();
  152 |
  153 |     // Test tenant management
  154 |     await page.waitForSelector('text=Tenants', { state: 'visible' });
  155 |     await page.click('text=Tenants');
  156 |     await page.waitForSelector('button:has-text("Add Tenant")', { state: 'visible' });
  157 |     await page.click('button:has-text("Add Tenant")');
  158 |     await page.waitForSelector('input[name="email"]', { state: 'visible' });
  159 |     await page.fill('input[name="email"]', 'newtenant@example.com');
  160 |     await page.fill('input[name="name"]', 'New Tenant');
  161 |     await page.click('button:has-text("Add")');
  162 |     await expect(page.locator('text=New Tenant')).toBeVisible();
  163 |   });
  164 |
  165 |   test('Admin flow', async ({ page }) => {
  166 |     // Sign in as admin
  167 |     await page.goto('/login');
  168 |     await page.waitForLoadState('networkidle');
  169 |     await page.waitForSelector('input[type="email"]', { state: 'visible' });
  170 |     await page.fill('input[type="email"]', 'admin@rentwithnook.com');
  171 |     await page.fill('input[type="password"]', 'admin123');
  172 |     await page.click('button[type="submit"]');
  173 |
  174 |     // Verify dashboard access
> 175 |     await expect(page).toHaveURL(/.*dashboard/);
      |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  176 |     await page.waitForLoadState('networkidle');
  177 |     await page.waitForSelector('text=Admin Dashboard', { state: 'visible' });
  178 |     await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  179 |
  180 |     // Test user management
  181 |     await page.waitForSelector('text=Users', { state: 'visible' });
  182 |     await page.click('text=Users');
  183 |     await expect(page.locator('text=User Management')).toBeVisible();
  184 |
  185 |     // Test feature toggles
  186 |     await page.waitForSelector('text=Settings', { state: 'visible' });
  187 |     await page.click('text=Settings');
  188 |     await page.waitForSelector('text=Feature Toggles', { state: 'visible' });
  189 |     await page.click('text=Feature Toggles');
  190 |     await expect(page.locator('text=Feature Management')).toBeVisible();
  191 |
  192 |     // Test system settings
  193 |     await page.waitForSelector('text=System Settings', { state: 'visible' });
  194 |     await page.click('text=System Settings');
  195 |     await expect(page.locator('text=System Configuration')).toBeVisible();
  196 |   });
  197 |
  198 |   test('Error handling', async ({ page }) => {
  199 |     // Test invalid login
  200 |     await page.goto('/login');
  201 |     await page.waitForLoadState('networkidle');
  202 |     await page.waitForSelector('input[type="email"]', { state: 'visible' });
  203 |     await page.fill('input[type="email"]', 'invalid@example.com');
  204 |     await page.fill('input[type="password"]', 'wrongpassword');
  205 |     await page.click('button[type="submit"]');
  206 |     await expect(page.locator('text=Invalid email or password')).toBeVisible();
  207 |
  208 |     // Test form validation
  209 |     await page.goto('/signup');
  210 |     await page.waitForLoadState('networkidle');
  211 |     await page.waitForSelector('button[type="submit"]', { state: 'visible' });
  212 |     await page.click('button[type="submit"]');
  213 |     await expect(page.locator('text=Email is required')).toBeVisible();
  214 |     await expect(page.locator('text=Password is required')).toBeVisible();
  215 |
  216 |     // Test 404 page
  217 |     await page.goto('/nonexistent');
  218 |     await expect(page.locator('text=Page not found')).toBeVisible();
  219 |   });
  220 | }); 
```