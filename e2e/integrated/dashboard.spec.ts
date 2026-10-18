import { expect, test, type Locator, type Page } from "@playwright/test";
import type { DashboardPeriod } from "../../src/@types/dashboard";
import { MESSAGES } from "../../src/constants/messages";
import { ROUTE_PATHS } from "../../src/constants/routes";
import { PERIOD_PARAM } from "../../src/pages/dashboard/overview/constants";
import {
  CHART_TITLES,
  DASHBOARD_MESSAGES,
  PERIOD_LABELS,
} from "../../src/pages/dashboard/overview/constants/messages";
import { signIn } from "../support/auth";
import { SCREEN_URLS } from "../support/constants";
import { dashboardSection, kpiCard, periodOption } from "../support/dashboard";
import { pathIs } from "../support/layout";
import { readSeedAccounts, type SeedAccounts } from "../support/seed-accounts";

const ACCOUNTS: SeedAccounts = readSeedAccounts();

const NOT_A_DIGIT: RegExp = /\D/g;

const ACTIVE_ORDERS_PATTERN: RegExp = /^\d+ pedidos? ativos?$/;

async function signInAsStaff(page: Page): Promise<void> {
  await page.goto(ROUTE_PATHS.LOGIN);
  await signIn(page, ACCOUNTS.staffEmail, ACCOUNTS.password);
  await expect(page).toHaveURL(pathIs(SCREEN_URLS.DASHBOARD));
}

async function choosePeriod(page: Page, period: DashboardPeriod): Promise<void> {
  await periodOption(page, period).click();
  await expect(page).toHaveURL(
    (url: URL): boolean => url.searchParams.get(PERIOD_PARAM) === period,
  );
  await expect(periodOption(page, period)).toBeChecked();
}

function chartOf(page: Page, title: string, period: DashboardPeriod): Locator {
  return dashboardSection(page, title).getByRole("img", {
    name: DASHBOARD_MESSAGES.CHART_LABEL(title, PERIOD_LABELS[period]),
  });
}

async function ordersShown(page: Page): Promise<number> {
  const value: Locator = kpiCard(page, DASHBOARD_MESSAGES.ORDERS).getByRole("paragraph").first();
  return Number(((await value.textContent()) ?? "").replace(NOT_A_DIGIT, ""));
}

test("staff reads the seeded orders of the last 30 days, then 7 days and today, each with its chart", async ({
  page,
}): Promise<void> => {
  await signInAsStaff(page);
  await expect(kpiCard(page, DASHBOARD_MESSAGES.ORDERS)).toBeVisible();

  await choosePeriod(page, "LAST_30_DAYS");
  await expect(chartOf(page, CHART_TITLES.DAY, "LAST_30_DAYS")).toBeVisible();
  await expect.poll((): Promise<number> => ordersShown(page)).toBeGreaterThan(0);

  await choosePeriod(page, "LAST_7_DAYS");
  await expect(chartOf(page, CHART_TITLES.DAY, "LAST_7_DAYS")).toBeVisible();

  await choosePeriod(page, "TODAY");
  await expect(chartOf(page, CHART_TITLES.HOUR, "TODAY")).toBeVisible();
});

test("staff sees how many orders are active next to Pedidos in the sidebar", async ({
  page,
}): Promise<void> => {
  await signInAsStaff(page);

  const navigation: Locator = page.getByRole("navigation", { name: MESSAGES.NAVIGATION.MAIN });

  await expect(navigation.getByText(ACTIVE_ORDERS_PATTERN)).toBeAttached();
});
