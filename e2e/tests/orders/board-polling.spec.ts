import type { Locator, Page } from "@playwright/test";
import type { StaffOrderPage, StaffOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { BOARD_COLUMN_LABELS, BOARD_TAB_LABELS } from "../../../src/constants/orders";
import { BOARD_MESSAGES } from "../../../src/pages/orders/order-list/board/constants/messages";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  boardCard,
  CLOCK_START,
  installClock,
  LIVE_POLL,
  minutesBefore,
  orderQueries,
  staffActionsFor,
  staffPage,
  staffSummary,
  stubOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const PAUSE_OFFSET_MS: number = 10_000;

const WAIT_MS: number = 12_000;

const POLL_MS: number = 30_000;

const EXIT_ANIMATION_MS: number = 1_000;

const STEP_MS: number = 100;

const UPDATED_PATTERN: RegExp = /Atualizado há (\d+) s/;

const WAITING: StaffOrderSummary = staffSummary(1043, { placedAt: minutesBefore(2) });

const NEW_ORDER: StaffOrderSummary = staffSummary(1045, {
  customerName: "Rafael T.",
  placedAt: CLOCK_START.toISOString(),
});

const FIRST_BOARD: StaffOrderPage = staffPage([WAITING]);

async function preparingOrders(page: Page): Promise<Locator> {
  if (!showsListCards(page)) {
    return page.getByRole("region", { name: BOARD_COLUMN_LABELS.PREPARING, exact: true });
  }
  await page.getByRole("tab", { name: new RegExp(BOARD_TAB_LABELS.PREPARING) }).click();
  return page.getByRole("tabpanel");
}

function updatedLabel(page: Page): Locator {
  return page.getByText(UPDATED_PATTERN);
}

async function secondsShown(page: Page): Promise<number> {
  const text: string = (await updatedLabel(page).textContent()) ?? "";
  return Number(UPDATED_PATTERN.exec(text)?.[1]);
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
  await stubOrders(api, FIRST_BOARD);
});

test("adds a new order on the next poll and announces it once, never on the first load nor on a status change", async ({
  page,
  api,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.ORDERS);
  await expect(boardCard(page, WAITING.number)).toBeVisible();
  await expect(page.getByText(MESSAGES.ORDERS.NEW_ORDER(WAITING.number))).toHaveCount(0);
  await stubOrders(api, staffPage([WAITING, NEW_ORDER]));

  await page.clock.fastForward(LIVE_POLL);
  await expect(boardCard(page, NEW_ORDER.number)).toContainText(NEW_ORDER.customerName);
  await expect(page.getByText(MESSAGES.ORDERS.NEW_ORDER(NEW_ORDER.number))).toHaveCount(1);
  await stubOrders(
    api,
    staffPage([WAITING, { ...NEW_ORDER, ...staffActionsFor("PREPARING"), status: "PREPARING" }]),
  );
  const preparing: Locator = await preparingOrders(page);
  const now: number = await page.evaluate((): number => Date.now());
  await page.clock.pauseAt(new Date(now + POLL_MS));
  await expect(async (): Promise<void> => {
    await page.clock.runFor(STEP_MS);
    await expect(preparing).toContainText(MESSAGES.ORDERS.NUMBER(NEW_ORDER.number), {
      timeout: STEP_MS,
    });
  }).toPass();
  await page.clock.runFor(EXIT_ANIMATION_MS);

  await expect(page.getByText(MESSAGES.ORDERS.NEW_ORDER(NEW_ORDER.number))).toHaveCount(0);
  expect(orderQueries(api)).toHaveLength(3);
  await expectNoHorizontalOverflow(page);
});

test("asks for the board again on Recarregar", async ({ page, api }): Promise<void> => {
  await page.goto(SCREEN_URLS.ORDERS);
  await expect(boardCard(page, WAITING.number)).toBeVisible();

  await page.getByRole("button", { name: BOARD_MESSAGES.RELOAD_LABEL }).click();

  await expect.poll((): number => orderQueries(api).length).toBe(2);
  await expect(page.getByRole("button", { name: BOARD_MESSAGES.RELOAD_LABEL })).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test("counts the seconds since the last update and the minutes since each order came in", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.ORDERS);
  await expect(updatedLabel(page)).toBeVisible();
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + PAUSE_OFFSET_MS));
  const before: number = await secondsShown(page);

  await page.clock.fastForward(WAIT_MS);

  await expect(updatedLabel(page)).toHaveText(
    MESSAGES.DATES.UPDATED_SECONDS_AGO(before + WAIT_MS / 1_000),
  );
  await expect(boardCard(page, WAITING.number)).toContainText(MESSAGES.DATES.AGE_MINUTES(2));
});
