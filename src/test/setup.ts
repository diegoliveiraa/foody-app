import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

type DomShim = () => unknown;

const RADIX_DOM_SHIMS: Record<string, DomShim> = {
  scrollIntoView: (): void => {},
  hasPointerCapture: (): boolean => false,
  releasePointerCapture: (): void => {},
};

function installRadixDomShims(): void {
  Object.entries(RADIX_DOM_SHIMS)
    .filter(([name]: [string, DomShim]): boolean => !(name in Element.prototype))
    .forEach(([name, shim]: [string, DomShim]): void => {
      Object.defineProperty(Element.prototype, name, { value: shim, configurable: true });
    });
}

beforeAll((): void => {
  installRadixDomShims();
  server.listen({ onUnhandledFrame: "error" });
});

afterEach((): void => {
  cleanup();
  server.resetHandlers();
});

afterAll((): void => {
  server.close();
});
