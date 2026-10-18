import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ActiveOrdersBadge } from "./active-orders-badge";
import { screenBadgeFor } from "./screen-badges";

describe("screenBadgeFor", () => {
  it("attaches the active orders count to the orders screen", () => {
    const badge: ReactElement | null = screenBadgeFor("orders.order-list");

    expect(badge?.type).toBe(ActiveOrdersBadge);
  });

  it("attaches nothing to the other screens of /me", () => {
    expect(screenBadgeFor("dashboard.overview")).toBeNull();
    expect(screenBadgeFor("catalog.products")).toBeNull();
    expect(screenBadgeFor("admin.users")).toBeNull();
  });

  it("attaches nothing to a screen key the front does not know", () => {
    expect(screenBadgeFor("reports.sales")).toBeNull();
  });
});
