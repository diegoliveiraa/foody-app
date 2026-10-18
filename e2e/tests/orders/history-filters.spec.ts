import type { Locator, Page } from "@playwright/test";
import type { StaffOrderPage } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { ORDER_STATUS_LABELS } from "../../../src/constants/orders";
import { HISTORY_MESSAGES } from "../../../src/pages/orders/order-list/history/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import { SCREEN_URLS, SKIP_REASONS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs, showsListCards } from "../../support/layout";
import { STAFF_ME } from "../../support/me";
import {
  historyQueries,
  installClock,
  minutesBefore,
  orderEntry,
  orderUrl,
  staffOrder,
  staffPage,
  staffSummary,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { chooseOption } from "../../support/select";
import { stubSession } from "../../support/session";

const DEFAULT_QUERY: Record<string, string> = {
  page: "1",
  pageSize: "10",
  sort: "placedAt,desc",
};

const HISTORY: StaffOrderPage = staffPage(
  [
    staffSummary(1042, {
      status: "DELIVERED",
      live: false,
      customerName: "Ana P.",
      placedAt: minutesBefore(60),
      total: 58.9,
    }),
    staffSummary(1031, {
      status: "CANCELLED",
      live: false,
      customerName: "Carla R.",
      placedAt: minutesBefore(3 * 24 * 60),
      total: 52.9,
    }),
  ],
  { totalItems: 25, totalPages: 3, hasNext: true },
);

const NOTHING: StaffOrderPage = staffPage([]);

function searchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: HISTORY_MESSAGES.SEARCH });
}

async function openHistory(page: Page, api: ApiStubs): Promise<void> {
  await stubOrders(api, HISTORY);
  await page.goto(SCREEN_URLS.ORDER_HISTORY);
  await expect(orderEntry(page, 1042)).toBeVisible();
}

async function goToSecondPage(page: Page, api: ApiStubs): Promise<void> {
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, page: "2" });
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("first asks for page 1 of 10 orders, newest first, and lists them", async ({
  page,
  api,
}): Promise<void> => {
  await openHistory(page, api);

  await expect(orderEntry(page, 1042)).toContainText("Ana P.");
  await expect(orderEntry(page, 1042)).toContainText(ORDER_STATUS_LABELS.DELIVERED);
  await expect(orderEntry(page, 1042)).toContainText(formatMoney(58.9));
  await expect(orderEntry(page, 1031)).toContainText(ORDER_STATUS_LABELS.CANCELLED);
  expect(historyQueries(api)).toEqual([DEFAULT_QUERY]);
  await expectNoHorizontalOverflow(page);
});

test("searches by number or customer once the typing settles, on the first page", async ({
  page,
  api,
}): Promise<void> => {
  await openHistory(page, api);
  await goToSecondPage(page, api);

  await searchBox(page).pressSequentially("1042");

  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, search: "1042" },
    ]);
});

test("filters by status and by dates, back on the first page", async ({
  page,
  api,
}): Promise<void> => {
  await openHistory(page, api);
  await goToSecondPage(page, api);

  await chooseOption(
    page,
    page.getByRole("combobox", { name: HISTORY_MESSAGES.STATUS_FILTER }),
    ORDER_STATUS_LABELS.CANCELLED,
  );
  await page.getByLabel(HISTORY_MESSAGES.FROM, { exact: true }).fill("2026-10-01");
  await page.getByLabel(HISTORY_MESSAGES.TO, { exact: true }).fill("2026-10-17");

  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({
      ...DEFAULT_QUERY,
      status: "CANCELLED",
      from: "2026-10-01",
      to: "2026-10-17",
    });
  await expectNoHorizontalOverflow(page);
});

test("refuses an end date earlier than the start, keeping the last results and asking nothing", async ({
  page,
  api,
}): Promise<void> => {
  await openHistory(page, api);
  const from: Locator = page.getByLabel(HISTORY_MESSAGES.FROM, { exact: true });
  const to: Locator = page.getByLabel(HISTORY_MESSAGES.TO, { exact: true });
  await from.fill("2026-10-10");
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, from: "2026-10-10" });

  await to.fill("2026-10-01");

  await expect(page.getByText(HISTORY_MESSAGES.INVERTED_RANGE)).toBeVisible();
  await expect(to).toHaveAttribute("aria-invalid", "true");
  await expect(orderEntry(page, 1042)).toBeVisible();
  await expect(page.getByText(HISTORY_MESSAGES.EMPTY)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expect(
    historyQueries(api).filter((query: Record<string, string>): boolean => "to" in query),
  ).toEqual([]);

  await to.fill("2026-10-17");

  await expect(page.getByText(HISTORY_MESSAGES.INVERTED_RANGE)).toHaveCount(0);
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, from: "2026-10-10", to: "2026-10-17" });
});

test("sorts by total from the column header, flipping the order on a second click", async ({
  page,
  api,
}): Promise<void> => {
  test.skip(showsListCards(page), SKIP_REASONS.LIST_TABLE);
  await openHistory(page, api);
  await goToSecondPage(page, api);
  const totalHeader: Locator = page.getByRole("columnheader", {
    name: HISTORY_MESSAGES.COLUMNS.TOTAL,
  });

  await totalHeader.getByRole("button").click();
  await expect(totalHeader).toHaveAttribute("aria-sort", "ascending");
  await totalHeader.getByRole("button").click();

  await expect(totalHeader).toHaveAttribute("aria-sort", "descending");
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toEqual([
      DEFAULT_QUERY,
      { ...DEFAULT_QUERY, page: "2" },
      { ...DEFAULT_QUERY, sort: "total,asc" },
      { ...DEFAULT_QUERY, sort: "total,desc" },
    ]);
  await expectNoHorizontalOverflow(page);
});

test("changes the page size back on the first page", async ({ page, api }): Promise<void> => {
  await openHistory(page, api);
  await goToSecondPage(page, api);

  await chooseOption(page, page.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE }), "25");

  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual({ ...DEFAULT_QUERY, pageSize: "25" });
});

test("offers to clear the filters when nothing matches them", async ({
  page,
  api,
}): Promise<void> => {
  await openHistory(page, api);
  await stubOrders(api, NOTHING);
  await chooseOption(
    page,
    page.getByRole("combobox", { name: HISTORY_MESSAGES.STATUS_FILTER }),
    ORDER_STATUS_LABELS.RECEIVED,
  );
  await expect(page.getByText(HISTORY_MESSAGES.EMPTY)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: HISTORY_MESSAGES.CLEAR_FILTERS }).click();

  await expect(orderEntry(page, 1042)).toBeVisible();
  await expect(page.getByRole("combobox", { name: HISTORY_MESSAGES.STATUS_FILTER })).toHaveText(
    MESSAGES.STATUS_FILTER_LABELS.ALL,
  );
  expect(historyQueries(api)).toEqual([DEFAULT_QUERY, { ...DEFAULT_QUERY, status: "RECEIVED" }]);
});

test("opens an order of the history", async ({ page, api }): Promise<void> => {
  await stubOrder(api, staffOrder(1042, { status: "DELIVERED", live: false }));
  await openHistory(page, api);

  await orderEntry(page, 1042)
    .getByRole("link", { name: MESSAGES.ORDERS.NUMBER(1042) })
    .click();

  await expect(page).toHaveURL(pathIs(orderUrl(staffOrder(1042).id)));
  await expect(
    page.getByRole("heading", { name: ORDER_DETAIL_MESSAGES.TITLE(1042, "Ana Souza") }),
  ).toBeVisible();
});
