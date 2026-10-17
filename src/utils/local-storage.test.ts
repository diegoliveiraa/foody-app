import { afterEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage } from "./local-storage";

afterEach((): void => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("local storage access", () => {
  it("reads back what was written under a key", () => {
    writeStorage("foody:test", "[1,2]");

    expect(readStorage("foody:test")).toBe("[1,2]");
  });

  it("reads nothing for a key never written", () => {
    expect(readStorage("foody:missing")).toBeNull();
  });

  it("reads nothing when the browser refuses access to the storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((): string => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(readStorage("foody:test")).toBeNull();
  });

  it("gives up silently when the storage is full or blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((): void => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect((): void => writeStorage("foody:test", "x")).not.toThrow();
  });
});
