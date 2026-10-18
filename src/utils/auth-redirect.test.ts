import { describe, expect, it } from "vitest";
import { authPathKeeping, redirectDestination } from "./auth-redirect";

describe("redirectDestination", () => {
  it("goes to the page the visitor was heading to, with its query", () => {
    const destination: string = redirectDestination("/my-orders?page=2");

    expect(destination).toBe("/my-orders?page=2");
  });

  it("falls back to the start, which opens the first screen, without a page to go back to", () => {
    const destination: string = redirectDestination(null);

    expect(destination).toBe("/");
  });

  it("falls back to the start instead of leaving the app", () => {
    const destinations: string[] = [
      redirectDestination("https://evil.example"),
      redirectDestination("//evil.example"),
      redirectDestination("/\\evil.example"),
    ];

    expect(destinations).toEqual(["/", "/", "/"]);
  });
});

describe("authPathKeeping", () => {
  it("carries the page the visitor was heading to into the other sign-in page", () => {
    const path: string = authPathKeeping("/register", "/my-orders?page=2");

    expect(path).toBe("/register?redirectTo=%2Fmy-orders%3Fpage%3D2");
  });

  it("links to the plain page without a page to go back to", () => {
    const path: string = authPathKeeping("/login", null);

    expect(path).toBe("/login");
  });

  it("drops a destination outside the app instead of passing it on", () => {
    const path: string = authPathKeeping("/register", "https://evil.example");

    expect(path).toBe("/register");
  });
});
