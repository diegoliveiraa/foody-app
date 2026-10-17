import { defineConfig, devices } from "@playwright/test";
import { readSeedAccounts } from "./e2e/support/seed-accounts";

const INTEGRATED_PORT: number = 4174;

const INTEGRATED_BASE_URL: string = `http://localhost:${INTEGRATED_PORT}`;

const LOCAL_API_URL: string = "http://localhost:8080";

const DESKTOP_WIDTH: number = 1280;

const DESKTOP_HEIGHT: number = 800;

const INTEGRATED_OUTPUT_DIR: string = "test-results-integrated";

readSeedAccounts();

export default defineConfig({
  testDir: "./e2e/integrated",
  outputDir: INTEGRATED_OUTPUT_DIR,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: INTEGRATED_BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "integrated-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${INTEGRATED_PORT} --strictPort`,
    url: INTEGRATED_BASE_URL,
    reuseExistingServer: false,
    env: { VITE_API_URL: LOCAL_API_URL },
  },
});
