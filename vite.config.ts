import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig, type ConfigEnv, type ViteUserConfig } from "vitest/config";

const API_URL_VARIABLE: string = "VITE_API_URL";

const API_URL_DEFINE: string = "import.meta.env.VITE_API_URL";

const DEFAULT_API_URL: string = "http://localhost:8080";

const TEST_API_URL: string = "http://api.test";

const TEST_MODE: string = "test";

function defaultApiUrl(mode: string): Record<string, string> {
  const configured: string =
    loadEnv(mode, import.meta.dirname, API_URL_VARIABLE)[API_URL_VARIABLE] ?? "";
  if (mode === TEST_MODE || configured.trim() !== "") {
    return {};
  }
  return { [API_URL_DEFINE]: JSON.stringify(DEFAULT_API_URL) };
}

export default defineConfig(({ mode }: ConfigEnv): ViteUserConfig => ({
  plugins: [react(), tailwindcss()],
  define: defaultApiUrl(mode),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      [API_URL_VARIABLE]: TEST_API_URL,
    },
  },
}));
