---
name: testing-e2e
description: "Write end-to-end tests that verify complete user workflows and critical system paths across the full stack"
---

# Skill: Testing E2E

## Goal
Write end-to-end tests that verify complete user workflows and critical system paths across the full stack.

## Use This Skill When
- Testing complete user journeys (login → checkout, etc.)
- Testing critical paths that must always work
- Verifying UI interactions with real browser
- Testing payment flows, authentication flows
- The user asks for "E2E tests" or "browser tests"

## Do Not Use This Skill When
- Testing individual functions (use unit tests)
- Testing component interactions (use integration tests)
- Quick feedback needed (E2E tests are slow)
- Testing implementation details

## E2E Test Focus Areas

### Critical Paths Only
E2E tests should cover:
- User authentication flows
- Core business workflows
- Payment/checkout processes
- Data export/import
- System-critical operations

### Avoid Testing
- Individual UI components (use integration/unit tests)
- Edge cases (use lower-level tests)
- Error handling for rare conditions
- Performance/speed

## E2E Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';

describe('User Checkout Flow', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('completes full checkout flow', async () => {
    // Navigate to store
    await page.goto('https://store.example.com');
    
    // Add item to cart
    await page.click('[data-testid="product-123"]');
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Fill shipping
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="address"]', '123 Test St');
    await page.click('[data-testid="continue-payment"]');
    
    // Complete payment (mock)
    await page.click('[data-testid="pay-with-test-card"]');
    
    // Verify success
    await expect(page.locator('.order-success')).toBeVisible();
    await expect(page.locator('.order-number')).toContainText('ORD-');
  });
});
```

## Authentication Flow Testing

```typescript
describe('Authentication E2E', () => {
  let page: Page;

  beforeEach(async () => {
    page = await browser.newPage();
    await page.cleanupCookies();
  });

  afterEach(async () => {
    await page.close();
  });

  describe('login flow', () => {
    it('logs in successfully with valid credentials', async () => {
      await page.goto('/login');
      
      await page.fill('[name="email"]', 'user@example.com');
      await page.fill('[name="password"]', 'correct-password');
      await page.click('[type="submit"]');
      
      // Should redirect to dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    it('shows error for invalid credentials', async () => {
      await page.goto('/login');
      
      await page.fill('[name="email"]', 'user@example.com');
      await page.fill('[name="password"]', 'wrong-password');
      await page.click('[type="submit"]');
      
      await expect(page.locator('.error-message')).toContainText('Invalid credentials');
      // Should still be on login page
      await page.waitForURL('/login');
    });

    it('persists login after page refresh', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('[name="email"]', 'user@example.com');
      await page.fill('[name="password"]', 'correct-password');
      await page.click('[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Refresh page
      await page.reload();
      
      // Should still be logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  describe('logout flow', () => {
    it('logs out and redirects to home', async () => {
      // Login first
      await loginAs(page, 'user@example.com');
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout"]');
      
      // Should redirect and show login
      await page.waitForURL('/');
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });
  });
});
```

## Critical Business Workflows

```typescript
describe('Order Management E2E', () => {
  let page: Page;
  const testUser = { email: 'shopper@example.com', password: 'shop-pass' };

  beforeAll(async () => {
    page = await browser.newPage();
    await createTestProduct(); // Setup
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('complete purchase flow with inventory check', async () => {
    // Browse products
    await page.goto('/products');
    await page.click('[data-testid="product-abc"]');
    
    // Add to cart
    await page.selectOption('[data-testid="quantity"]', '2');
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart
    await page.click('[data-testid="cart"]');
    const cartTotal = await page.locator('.cart-total').textContent();
    expect(cartTotal).toContain('$99.98'); // 2 x $49.99
    
    // Checkout
    await page.click('[data-testid="checkout"]');
    
    // Shipping
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="zip"]', '12345');
    await page.click('[data-testid="continue"]');
    
    // Payment
    await page.frameLocator('iframe[name="stripe"]')
      .locator('[name="cardnumber"]')
      .fill('4242424242424242');
    await page.frameLocator('iframe[name="stripe"]')
      .locator('[name="exp-date"]')
      .fill('12/25');
    await page.frameLocator('iframe[name="stripe"]')
      .locator('[name="cvc"]')
      .fill('123');
    await page.click('[data-testid="pay"]');
    
    // Verify order
    await page.waitForSelector('.order-confirmation');
    const orderNumber = await page.locator('.order-number').textContent();
    expect(orderNumber).toMatch(/ORD-\d+/);
    
    // Verify email sent (check logs or use test inbox)
    const emailSent = await waitForEmail(testUser.email, 'Order Confirmation');
    expect(emailSent.subject).toContain(orderNumber);
  });

  it('handles out-of-stock scenario', async () => {
    // Setup: mark product as out of stock
    await setProductStock('abc', 0);
    
    await page.goto('/products/abc');
    
    // Should show out of stock
    await expect(page.locator('[data-testid="out-of-stock"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeDisabled();
  });
});
```

## Testing Error Recovery

```typescript
describe('Error Handling E2E', () => {
  let page: Page;

  beforeEach(async () => {
    page = await browser.newPage();
  });

  it('recovers from network failure', async () => {
    await page.goto('/dashboard');
    
    // Simulate network failure
    await page.route('**/api/data', route => route.abort('failed'));
    await page.click('[data-testid="refresh-data"]');
    
    // Should show error and retry option
    await expect(page.locator('.error-banner')).toContainText('Connection failed');
    
    // Restore connection
    await page.unroute('**/api/data');
    await page.click('[data-testid="retry"]');
    
    // Should recover
    await expect(page.locator('.error-banner')).toBeHidden();
  });

  it('handles session timeout gracefully', async () => {
    // Login and wait for session to expire
    await loginAs(page, 'user@example.com');
    await page.evaluate(() => {
      // Expire session in localStorage
      localStorage.setItem('sessionExpiry', Date.now() - 1000);
    });
    
    // Try to access protected page
    await page.goto('/protected');
    
    // Should redirect to login
    await page.waitForURL('/login?reason=session_expired');
    await expect(page.locator('.session-expired-message')).toBeVisible();
  });
});
```

## Performance Testing

```typescript
describe('Performance E2E', () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
  });

  it('loads page within time budget', async () => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  it('completes search within time budget', async () => {
    await page.goto('/products');
    
    const start = Date.now();
    await page.fill('[name="search"]', 'laptop');
    await page.waitForSelector('.product-card');
    
    const searchTime = Date.now() - start;
    expect(searchTime).toBeLessThan(1000); // 1 second budget
  });
});
```

## Test Data Management

```typescript
// test-utils.ts
import { test as base } from 'vitest';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Setup test user
    const testUser = await createTestUser();
    
    // Navigate to clean state
    await page.goto('/');
    await page.cleanupCookies();
    
    await use(page);
    
    // Cleanup
    await cleanupTestUser(testUser);
  },

  authenticatedPage: async ({ page }, use) => {
    // Login as test user
    await loginAs(page, 'e2e-test@example.com');
    await page.waitForURL('/dashboard');
    
    await use(page);
  }
});

async function createTestUser() {
  // Create user in test database
  // Return user credentials
}

async function cleanupTestUser(user) {
  // Remove test user and associated data
}
```

## Best Practices

### 1. Use Stable Selectors
```typescript
// GOOD - stable test IDs
await page.click('[data-testid="add-to-cart"]');

// BAD - fragile selectors
await page.click('.css-1x9lkaj button:nth-child(2)');
```

### 2. Handle Dynamic Content
```typescript
// Wait for dynamic content
await page.waitForSelector('[data-testid="loaded-content"]');

// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

### 3. Use Fixtures for Test Data
```typescript
// fixtures/test-data.json
{
  "users": {
    "standard": { "email": "user@test.com", "password": "test123" },
    "admin": { "email": "admin@test.com", "password": "admin123" }
  },
  "products": {
    "inStock": { "id": "prod-1", "stock": 100 },
    "outOfStock": { "id": "prod-2", "stock": 0 }
  }
}
```

### 4. Parallel Execution
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    workers: 4, // Run E2E tests in parallel
    retry: 2,   // Retry flaky tests
  }
});
```

## Output
- E2E test files for critical user workflows
- Browser automation setup with Playwright
- Test fixtures and data management
- Error recovery and edge case tests
- Performance assertions

## References
- Playwright: https://playwright.dev/
- Vitest: https://vitest.dev/
- Test strategy: https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
