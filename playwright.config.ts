import { defineConfig, devices } from '@playwright/test';

// PW_CHROME erlaubt, einen bereits vorhandenen Chromium zu nutzen (statt `playwright install`).
const launchOptions = process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {};

export default defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://localhost:4321', trace: 'off', launchOptions },
  projects: [
    { name: 'mobil', use: { ...devices['Pixel 7'], launchOptions } },
    { name: 'mobil-schmal', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 }, launchOptions } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 }, launchOptions } },
  ],
  webServer: { command: 'npx astro preview --port 4321 --ignore-lock', url: 'http://localhost:4321', reuseExistingServer: false },
});
