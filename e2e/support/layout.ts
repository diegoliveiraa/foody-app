import { expect, type Locator, type Page } from "@playwright/test";
import { LIST_TABLE_BREAKPOINT_PX } from "../../src/constants/breakpoints";
import { MOBILE_MAX_WIDTH } from "./constants";

export type BoundingBox = Awaited<ReturnType<Locator["boundingBox"]>>;

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow: number = await page.evaluate(
    (): number => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow in pixels").toBeLessThanOrEqual(0);
}

export function isMobileViewport(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) <= MOBILE_MAX_WIDTH;
}

export function showsListCards(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) < LIST_TABLE_BREAKPOINT_PX;
}

export function pathIs(pathname: string): (url: URL) => boolean {
  return (url: URL): boolean => url.pathname === pathname;
}
