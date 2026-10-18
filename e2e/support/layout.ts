import { expect, type Locator, type Page } from "@playwright/test";
import { LIST_TABLE_BREAKPOINT_PX } from "../../src/constants/breakpoints";
import {
  DIALOG_CHECK_WIDTHS,
  LAYOUT_TOLERANCE_PX,
  MOBILE_MAX_WIDTH,
  STACKED_DIALOG_ACTIONS_MAX_WIDTH,
  VIEWPORT_HEIGHT,
} from "./constants";

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

export function stacksDialogActions(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) <= STACKED_DIALOG_ACTIONS_MAX_WIDTH;
}

function escapingElements(root: Element, tolerance: number): string[] {
  const box: DOMRect = root.getBoundingClientRect();
  return Array.from(root.querySelectorAll("*"))
    .filter((element: Element): boolean => {
      const rect: DOMRect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }
      return (
        rect.left < box.left - tolerance ||
        rect.right > box.right + tolerance ||
        rect.top < box.top - tolerance ||
        rect.bottom > box.bottom + tolerance
      );
    })
    .map((element: Element): string => `${element.tagName} ${element.textContent ?? ""}`);
}

export async function expectChildrenInside(container: Locator): Promise<void> {
  await expect
    .poll((): Promise<string[]> => container.evaluate(escapingElements, LAYOUT_TOLERANCE_PX), {
      message: "elements drawn outside the box",
    })
    .toEqual([]);
}

export async function expectInsideAtEveryDialogWidth(page: Page, dialog: Locator): Promise<void> {
  const original: { width: number; height: number } | null = page.viewportSize();
  for (const width of DIALOG_CHECK_WIDTHS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await expect(dialog).toBeVisible();
    await expectChildrenInside(dialog);
    await expectNoHorizontalOverflow(page);
  }
  if (original !== null) {
    await page.setViewportSize(original);
  }
  await expectChildrenInside(dialog);
}
