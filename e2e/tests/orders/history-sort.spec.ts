import type { Page } from "@playwright/test";
import type { StaffOrderPage } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { HISTORY_MESSAGES } from "../../../src/pages/orders/order-list/history/constants/messages";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  historyQueries,
  installClock,
  minutesBefore,
  orderEntry,
  staffPage,
  staffSummary,
  stubOrders,
} from "../../support/orders";
import { chooseOption, sortOptionLabels, sortSelect } from "../../support/select";
import { stubSession } from "../../support/session";

const DEFAULT_QUERY: Record<string, string> = {
  page: "1",
  pageSize: "10",
  sort: "placedAt,desc",
};

const HISTORY: StaffOrderPage = staffPage(
  [
    staffSummary(1042, { status: "DELIVERED", live: false, placedAt: minutesBefore(60) }),
    staffSummary(1031, { status: "CANCELLED", live: false, placedAt: minutesBefore(120) }),
  ],
  { totalItems: 25, totalPages: 3, hasNext: true },
);

async function openHistoryOnSecondPage(page: Page, api: ApiStubs): Promise<void> {
  await stubOrders(api, HISTORY);
  await page.goto(SCREEN_URLS.ORDER_HISTORY);
  await expect(orderEntry(page, 1042)).toBeVisible();
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, page: "2" });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("offers the history's sorts in plain words above the cards, starting at the newest", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await stubOrders(api, HISTORY);

  await page.goto(SCREEN_URLS.ORDER_HISTORY);

  await expect(sortSelect(page)).toHaveText(HISTORY_MESSAGES.SORT_OPTIONS.NEWEST);
  expect(await sortOptionLabels(page)).toEqual([
    "Mais recentes",
    "Mais antigos",
    "Maior total",
    "Menor total",
    "Número (maior)",
    "Número (menor)",
  ]);
  await expectNoHorizontalOverflow(page);
});

test("sorts the cards by the chosen option, back on the first page", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(!showsListCards(page), SKIP_REASONS.LIST_CARDS);
  await openHistoryOnSecondPage(page, api);

  await chooseOption(page, sortSelect(page), HISTORY_MESSAGES.SORT_OPTIONS.LOWEST_TOTAL);
  await expect(sortSelect(page)).toHaveText(HISTORY_MESSAGES.SORT_OPTIONS.LOWEST_TOTAL);
  await chooseOption(page, sortSelect(page), HISTORY_MESSAGES.SORT_OPTIONS.NUMBER_DESC);

  await expect(sortSelect(page)).toHaveText(HISTORY_MESSAGES.SORT_OPTIONS.NUMBER_DESC);
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "total,asc" },
      { ...DEFAULT_QUERY, sort: "number,desc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("leaves sorting to the column headers next to the table", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await stubOrders(api, HISTORY);

  await page.goto(SCREEN_URLS.ORDER_HISTORY);

  await expect(orderEntry(page, 1042)).toBeVisible();
  await expect(sortSelect(page)).toHaveCount(0);
});
