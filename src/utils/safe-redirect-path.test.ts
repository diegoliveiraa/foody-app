import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect-path";

describe("safeRedirectPath", () => {
  it("keeps a path inside the app, with its query", () => {
    const path: string | null = safeRedirectPath("/catalog/products?page=2");

    expect(path).toBe("/catalog/products?page=2");
  });

  it("ignores a missing value", () => {
    const path: string | null = safeRedirectPath(null);

    expect(path).toBeNull();
  });

  it("rejects an absolute URL to another site", () => {
    const path: string | null = safeRedirectPath("https://evil.example/login");

    expect(path).toBeNull();
  });

  it("rejects a protocol-relative URL", () => {
    const path: string | null = safeRedirectPath("//evil.example");

    expect(path).toBeNull();
  });

  it("rejects a backslash trick that browsers read as another host", () => {
    const path: string | null = safeRedirectPath("/\\evil.example");

    expect(path).toBeNull();
  });
});
