import type { Locator, Page } from "@playwright/test";
import { API_PATHS, HTTP_STATUS } from "../../../src/constants/api";
import { MESSAGES } from "../../../src/constants/messages";
import { ROUTE_PATHS } from "../../../src/constants/routes";
import { MY_ORDERS_MESSAGES } from "../../../src/pages/store/my-orders/list/constants/messages";
import { HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { customerPage, customerSummary, MY_ORDERS_PATH, stubMyOrders } from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

function loadMoreButton(page: Page): Locator {
  return page.getByRole("button", { name: MY_ORDERS_MESSAGES.LOAD_MORE });
}

test("tells in neutral words that the session ended when the API refuses it, back on the login page", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, CUSTOMER_ME);
  await stubMyOrders(api, customerPage([customerSummary(1042)], { hasNext: true, totalPages: 2 }));
  await page.goto(SCREEN_URLS.MY_ORDERS);
  await expect(loadMoreButton(page)).toBeVisible();
  await api.respond(
    HTTP_METHODS.GET,
    MY_ORDERS_PATH,
    problem(HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED", "Conta desabilitada."),
    HTTP_STATUS.UNAUTHORIZED,
  );
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.REFRESH,
    problem(HTTP_STATUS.UNAUTHORIZED, "REFRESH_TOKEN_INVALID", "Sessão inválida."),
    HTTP_STATUS.UNAUTHORIZED,
  );

  await loadMoreButton(page).click();

  await expect(page.getByText(MESSAGES.SESSION.ENDED)).toBeVisible();
  await expect(page).toHaveURL(pathIs(ROUTE_PATHS.LOGIN));
  await expect(page.getByRole("heading", { name: MESSAGES.LOGIN.TITLE, level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
