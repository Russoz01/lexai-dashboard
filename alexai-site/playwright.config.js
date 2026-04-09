import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:8090',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npx http-server . -p 8090 -c-1 --silent',
    url: 'http://localhost:8090',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
