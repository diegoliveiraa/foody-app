import type { Locator, Page } from "@playwright/test";
import type { StaffOrderPage, StaffOrderSummary } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { ORDER_STATUS_LABELS } from "../../../src/constants/orders";
import type { PageSize } from "../../../src/constants/pagination";
import { ORDER_LIST_MESSAGES } from "../../../src/pages/orders/order-list/constants/messages";
import { ORDER_DETAIL_MESSAGES } from "../../../src/pages/orders/order-list/detail/constants/messages";
import { HISTORY_MESSAGES } from "../../../src/pages/orders/order-list/history/constants/messages";
import { openBackofficeNavigation } from "../../support/backoffice";
import { EVERY_PRODUCT, productsPage, stubCategories, stubProducts } from "../../support/catalog";
import { SCREEN_URLS } from "../../support/constants";
import { expect, test, type ApiStubs } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs, showsListCards } from "../../support/layout";
import { ME_LABELS, STAFF_ME } from "../../support/me";
import {
  historyQueries,
  installClock,
  minutesBefore,
  orderEntry,
  staffOrder,
  staffPage,
  staffSummary,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { chooseOption, sortSelect } from "../../support/select";
import { stubSession } from "../../support/session";

const CANCELLED_ORDER: StaffOrderSummary = staffSummary(1042, {
  status: "CANCELLED",
  live: false,
  customerName: "Ana P.",
  placedAt: minutesBefore(60),
});

function historyPage(page: number, pageSize: PageSize): StaffOrderPage {
  return staffPage([CANCELLED_ORDER], {
    page,
    pageSize,
    totalItems: 60,
    totalPages: 3,
    hasNext: true,
    hasPrevious: page > 1,
  });
}

const NARROWED_QUERY: Record<string, string> = {
  search: "ana",
  status: "CANCELLED",
  from: "2026-10-01",
  to: "2026-10-17",
  page: "2",
  pageSize: "25",
  sort: "total,asc",
};

function totalHeader(page: Page): Locator {
  return page.getByRole("columnheader", { name: HISTORY_MESSAGES.COLUMNS.TOTAL });
}

function historyTabs(page: Page): Locator {
  return page.getByRole("navigation", { name: ORDER_LIST_MESSAGES.VIEWS });
}

async function sortByLowestTotal(page: Page): Promise<void> {
  if (showsListCards(page)) {
    await chooseOption(page, sortSelect(page), HISTORY_MESSAGES.SORT_OPTIONS.LOWEST_TOTAL);
    return;
  }
  await totalHeader(page).getByRole("button").click();
}

async function narrowTheHistory(page: Page, api: ApiStubs): Promise<void> {
  await stubOrders(api, historyPage(1, 10));
  await page.goto(SCREEN_URLS.ORDER_HISTORY);
  await expect(orderEntry(page, 1042)).toBeVisible();
  await page.getByRole("searchbox", { name: HISTORY_MESSAGES.SEARCH }).fill("ana");
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual(expect.objectContaining({ search: "ana" }));
  await chooseOption(
    page,
    page.getByRole("combobox", { name: HISTORY_MESSAGES.STATUS_FILTER }),
    ORDER_STATUS_LABELS.CANCELLED,
  );
  await page.getByLabel(HISTORY_MESSAGES.FROM, { exact: true }).fill("2026-10-01");
  await page.getByLabel(HISTORY_MESSAGES.TO, { exact: true }).fill("2026-10-17");
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual(expect.objectContaining({ to: "2026-10-17" }));
  await stubOrders(api, historyPage(1, 25));
  await chooseOption(page, page.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE }), "25");
  await sortByLowestTotal(page);
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual(expect.objectContaining({ pageSize: "25", sort: "total,asc" }));
  await stubOrders(api, historyPage(2, 25));
  await page.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }).click();
  await expect
    .poll((): Record<string, string>[] => historyQueries(api))
    .toContainEqual(NARROWED_QUERY);
}

async function expectTheNarrowedHistory(page: Page, api: ApiStubs): Promise<void> {
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDER_HISTORY));
  await expect(page.getByRole("searchbox", { name: HISTORY_MESSAGES.SEARCH })).toHaveValue("ana");
  await expect(page.getByRole("combobox", { name: HISTORY_MESSAGES.STATUS_FILTER })).toHaveText(
    ORDER_STATUS_LABELS.CANCELLED,
  );
  await expect(page.getByLabel(HISTORY_MESSAGES.FROM, { exact: true })).toHaveValue("2026-10-01");
  await expect(page.getByLabel(HISTORY_MESSAGES.TO, { exact: true })).toHaveValue("2026-10-17");
  await expect(page.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE })).toHaveText("25");
  await expect(page.getByText(MESSAGES.LIST.PAGE_OF(2, 3))).toBeVisible();
  if (showsListCards(page)) {
    await expect(sortSelect(page)).toHaveText(HISTORY_MESSAGES.SORT_OPTIONS.LOWEST_TOTAL);
  } else {
    await expect(totalHeader(page)).toHaveAttribute("aria-sort", "ascending");
  }
  await expect(orderEntry(page, 1042)).toBeVisible();
  expect(historyQueries(api).at(-1)).toEqual(NARROWED_QUERY);
  await expectNoHorizontalOverflow(page);
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await installClock(page);
  await stubSession(api, STAFF_ME);
});

test("brings back the search, filters, sort and page after opening an order and going back", async ({
  page,
  api,
}): Promise<void> => {
  await stubOrder(api, staffOrder(1042, { status: "CANCELLED", live: false }));
  await narrowTheHistory(page, api);
  await orderEntry(page, 1042)
    .getByRole("link", { name: MESSAGES.ORDERS.NUMBER(1042) })
    .click();
  await expect(
    page.getByRole("heading", { name: ORDER_DETAIL_MESSAGES.TITLE(1042, "Ana Souza") }),
  ).toBeVisible();

  await page.goBack();

  await expectTheNarrowedHistory(page, api);
});

test("brings them back when the history is opened again from the tabs", async ({
  page,
  api,
}): Promise<void> => {
  await narrowTheHistory(page, api);
  await historyTabs(page).getByRole("link", { name: ORDER_LIST_MESSAGES.ACTIVE }).click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));

  await historyTabs(page).getByRole("link", { name: ORDER_LIST_MESSAGES.HISTORY }).click();

  await expectTheNarrowedHistory(page, api);
});

test("brings them back after another screen was opened from the sidebar", async ({
  page,
  api,
}): Promise<void> => {
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));
  await narrowTheHistory(page, api);
  await (
    await openBackofficeNavigation(page)
  )
    .getByRole("link", { name: ME_LABELS.PRODUCTS })
    .click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.PRODUCTS));
  await (
    await openBackofficeNavigation(page)
  )
    .getByRole("link", { name: ME_LABELS.ORDER_LIST })
    .click();
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.ORDERS));

  await historyTabs(page).getByRole("link", { name: ORDER_LIST_MESSAGES.HISTORY }).click();

  await expectTheNarrowedHistory(page, api);
});
