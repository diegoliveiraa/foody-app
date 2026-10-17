import type { Locator } from "@playwright/test";
import { MESSAGES } from "../../../src/constants/messages";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import {
  expectNoHorizontalOverflow,
  isMobileViewport,
  pathIs,
  type BoundingBox,
} from "../../support/layout";
import { CUSTOMER_ME, ME_LABELS } from "../../support/me";
import { stubSession } from "../../support/session";

const TOP_BAR_MAX_Y: number = 80;

test("moves between the store screens that /me offers", async ({ page, api }): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await page.goto(SCREEN_URLS.MENU);
  const navigation: Locator = page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });

  await navigation.getByRole("link", { name: ME_LABELS.MY_ORDERS }).click();

  await expect(page).toHaveURL(pathIs(SCREEN_URLS.MY_ORDERS));
  await expect(page.getByRole("heading", { name: ME_LABELS.MY_ORDERS })).toBeVisible();
  await expect(page.getByText(MESSAGES.SCREEN_PLACEHOLDER.TITLE)).toBeVisible();
  await expect(navigation.getByRole("link", { name: ME_LABELS.MY_ORDERS })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expectNoHorizontalOverflow(page);
});

test("keeps the store navigation in a tab bar at the bottom on phones", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!isMobileViewport(page), SKIP_REASONS.PHONES_ONLY);
  await stubSession(api, CUSTOMER_ME);

  await page.goto(SCREEN_URLS.MENU);

  const navigation: Locator = page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });
  const box: BoundingBox = await navigation.boundingBox();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(page.viewportSize()?.height);
  await expect(navigation.getByRole("button", { name: MESSAGES.NAVIGATION.ACCOUNT })).toBeVisible();
});

test("keeps the store navigation in a top bar from tablets up", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(isMobileViewport(page), SKIP_REASONS.TABLETS_UP);
  await stubSession(api, CUSTOMER_ME);

  await page.goto(SCREEN_URLS.MENU);

  const navigation: Locator = page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });
  const box: BoundingBox = await navigation.boundingBox();
  expect(box?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(TOP_BAR_MAX_Y);
  await expect(page.getByRole("button", { name: MESSAGES.NAVIGATION.ACCOUNT })).toBeVisible();
});
