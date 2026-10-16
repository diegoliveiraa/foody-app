import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

beforeAll((): void => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach((): void => {
  cleanup();
  server.resetHandlers();
});

afterAll((): void => {
  server.close();
});
