import { execSync } from 'child_process';
import { test as base } from '@playwright/test';

// Start the Next.js server before all tests
async function globalSetup() {
  // Start the Next.js server
  const server = execSync('npm run dev', { stdio: 'inherit' });

  // Wait for the server to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

// Clean up after all tests
async function globalTeardown() {
  // Kill the Next.js server
  execSync('pkill -f "next dev"', { stdio: 'inherit' });
}

// Extend the base test with our custom setup
export const test = base.extend({
  // Add any custom fixtures here if needed
});

export { globalSetup, globalTeardown }; 