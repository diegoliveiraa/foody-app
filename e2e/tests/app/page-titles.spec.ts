import { ROUTE_PATHS } from "../../../src/constants/routes";
import { SCREEN_URLS } from "../../support/constants";
import { dashboardResponse, stubDashboard } from "../../support/dashboard";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { ADMIN_ME, CUSTOMER_ME, STAFF_ME } from "../../support/me";
import { EVERY_PRODUCT, productsPage, stubCategories, stubProducts } from "../../support/catalog";
import { itemOf, priced, quoteOf, seedCart, SMASH, stubMenu, stubQuote } from "../../support/menu";
import {
  customerOrder,
  customerPage,
  customerSummary,
  installClock,
  myOrderUrl,
  orderUrl,
  staffOrder,
  staffPage,
  staffSummary,
  stubMyOrder,
  stubMyOrders,
  stubOrder,
  stubOrders,
} from "../../support/orders";
import { stubSession, stubSignedOut } from "../../support/session";
import { EVERYONE, stubUsers, usersPage } from "../../support/users";

test.beforeEach(async ({ page }): Promise<void> => {
  await installClock(page);
});

test("names the sign-in and sign-up pages in the browser tab", async ({
  page,
  api,
}): Promise<void> => {
  await stubSignedOut(api);

  await page.goto(ROUTE_PATHS.LOGIN);
  await expect(page).toHaveTitle("Entrar · Foody");
  await page.goto(ROUTE_PATHS.REGISTER);

  await expect(page).toHaveTitle("Criar conta · Foody");
  await expectNoHorizontalOverflow(page);
});

test("names the customer's screens after their /me labels and visible titles", async ({
  page,
  api,
}): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1)]);
  await stubSession(api, CUSTOMER_ME);
  await stubMenu(api);
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9)], 34.9));
  await stubMyOrders(api, customerPage([customerSummary(1101)]));
  await stubMyOrder(api, customerOrder(1101));

  await page.goto(SCREEN_URLS.MENU);
  await expect(page).toHaveTitle("Cardápio · Foody");
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(page).toHaveTitle("Finalizar pedido · Foody");
  await page.goto(SCREEN_URLS.MY_ORDERS);
  await expect(page).toHaveTitle("Pedidos · Foody");
  await page.goto(myOrderUrl(customerOrder(1101).id));

  await expect(page).toHaveTitle("Pedido #1101 · Foody");
  await expectNoHorizontalOverflow(page);
});

test("names the staff's screens after their visible titles and the order they show", async ({
  page,
  api,
}): Promise<void> => {
  await stubSession(api, STAFF_ME);
  await stubDashboard(api, dashboardResponse());
  await stubOrders(api, staffPage([staffSummary(1101)]));
  await stubOrder(api, staffOrder(1101));
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));

  await page.goto(SCREEN_URLS.DASHBOARD);
  await expect(page).toHaveTitle("Dashboard · Foody");
  await page.goto(SCREEN_URLS.ORDERS);
  await expect(page).toHaveTitle("Pedidos · Foody");
  await page.goto(SCREEN_URLS.ORDER_HISTORY);
  await expect(page).toHaveTitle("Pedidos · Foody");
  await page.goto(SCREEN_URLS.PRODUCTS);
  await expect(page).toHaveTitle("Produtos · Foody");
  await page.goto(SCREEN_URLS.CATEGORIES);
  await expect(page).toHaveTitle("Categorias · Foody");
  await page.goto(orderUrl(staffOrder(1101).id));

  await expect(page).toHaveTitle("Pedido #1101 · Foody");
  await expectNoHorizontalOverflow(page);
});

test("names the users screen after its /me label", async ({ page, api }): Promise<void> => {
  await stubSession(api, ADMIN_ME);
  await stubUsers(api, usersPage(EVERYONE));

  await page.goto(SCREEN_URLS.ADMIN_USERS);

  await expect(page).toHaveTitle("Usuários · Foody");
  await expectNoHorizontalOverflow(page);
});
