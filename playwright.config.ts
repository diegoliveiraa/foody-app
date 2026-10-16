import { defineConfig, devices } from '@playwright/test'

const BASE_URL: string = 'http://localhost:5173'

export default defineConfig({
  testDir: './e2e/tests',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
  },
})
