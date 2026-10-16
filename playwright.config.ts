import { defineConfig, devices, type Project } from "@playwright/test";
import {
  E2E_API_URL,
  E2E_BASE_URL,
  E2E_PORT,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTHS,
} from "./e2e/support/constants";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
  },
  projects: VIEWPORT_WIDTHS.map((width: number): Project => ({
    name: `${width}px`,
    use: { ...devices["Desktop Chrome"], viewport: { width, height: VIEWPORT_HEIGHT } },
  })),
  webServer: {
    command: `npm run dev -- --port ${E2E_PORT} --strictPort`,
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_URL: E2E_API_URL },
  },
});
