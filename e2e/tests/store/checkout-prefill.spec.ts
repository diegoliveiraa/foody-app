import type { Page } from "@playwright/test";
import type { CustomerOrder } from "../../../src/@types/orders";
import { CHECKOUT_MESSAGES } from "../../../src/pages/store/menu/checkout/constants/messages";
import { sentBodies } from "../../support/catalog";
import { addressField, lastAddressHint, placeOrderButton } from "../../support/checkout";
import {
  HTTP_CREATED,
  HTTP_INTERNAL_ERROR,
  HTTP_METHODS,
  SCREEN_URLS,
} from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import { itemOf, LIMONADA, priced, quoteOf, seedCart, SMASH, stubQuote } from "../../support/menu";
import {
  customerOrder,
  customerPage,
  customerSummary,
  MY_ORDERS_PATH,
  myOrderPath,
  myOrderUrl,
  PAULISTA,
  stubMyOrder,
  stubMyOrders,
} from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const LAST: CustomerOrder = customerOrder(1042, { status: "DELIVERED", live: false });

const OLDER: CustomerOrder = customerOrder(1031, { status: "DELIVERED", live: false });

const PLACED: CustomerOrder = customerOrder(1043);

const EMPTY_ADDRESS_FIELDS: readonly string[] = [
  CHECKOUT_MESSAGES.ZIP_CODE,
  CHECKOUT_MESSAGES.STREET,
  CHECKOUT_MESSAGES.NUMBER,
  CHECKOUT_MESSAGES.COMPLEMENT,
  CHECKOUT_MESSAGES.NEIGHBORHOOD,
  CHECKOUT_MESSAGES.CITY,
];

async function expectEmptyAddress(page: Page): Promise<void> {
  for (const label of EMPTY_ADDRESS_FIELDS) {
    await expect(addressField(page, label)).toHaveValue("");
  }
  await expect(addressField(page, CHECKOUT_MESSAGES.STATE)).toHaveText(
    CHECKOUT_MESSAGES.CHOOSE_STATE,
  );
}

test.beforeEach(async ({ page, api }): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1), itemOf(LIMONADA, 2)]);
  await stubSession(api, CUSTOMER_ME);
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9), priced(LIMONADA, 2, 24)], 58.9));
});

test("fills the address with the one of the customer's last order and says so", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrders(
    api,
    customerPage([customerSummary(LAST.number), customerSummary(OLDER.number)]),
  );
  await stubMyOrder(api, LAST);

  await page.goto(SCREEN_URLS.CHECKOUT);

  await expect(lastAddressHint(page)).toBeVisible();
  await expect(addressField(page, CHECKOUT_MESSAGES.ZIP_CODE)).toHaveValue(PAULISTA.zipCode);
  await expect(addressField(page, CHECKOUT_MESSAGES.STREET)).toHaveValue(PAULISTA.street);
  await expect(addressField(page, CHECKOUT_MESSAGES.NUMBER)).toHaveValue(PAULISTA.number);
  await expect(addressField(page, CHECKOUT_MESSAGES.COMPLEMENT)).toHaveValue("Apto 42");
  await expect(addressField(page, CHECKOUT_MESSAGES.NEIGHBORHOOD)).toHaveValue(
    PAULISTA.neighborhood,
  );
  await expect(addressField(page, CHECKOUT_MESSAGES.CITY)).toHaveValue(PAULISTA.city);
  await expect(addressField(page, CHECKOUT_MESSAGES.STATE)).toHaveText(PAULISTA.state);
  expect(api.requests(HTTP_METHODS.GET, myOrderPath(OLDER.id))).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

test("places the order with the remembered address and what the customer changed in it", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrders(api, customerPage([customerSummary(LAST.number)]));
  await stubMyOrder(api, LAST);
  await api.respond(HTTP_METHODS.POST, MY_ORDERS_PATH, PLACED, HTTP_CREATED);
  await stubMyOrder(api, PLACED);
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(lastAddressHint(page)).toBeVisible();
  await expect(placeOrderButton(page)).toBeEnabled();

  await addressField(page, CHECKOUT_MESSAGES.NUMBER).fill("1200");

  await expect(lastAddressHint(page)).toHaveCount(0);
  await placeOrderButton(page).click();
  await expect(page).toHaveURL(pathIs(myOrderUrl(PLACED.id)));
  expect(sentBodies(api, HTTP_METHODS.POST, MY_ORDERS_PATH)).toEqual([
    {
      items: [itemOf(SMASH, 1), itemOf(LIMONADA, 2)],
      deliveryAddress: { ...PAULISTA, number: "1200" },
    },
  ]);
});

test("starts with an empty address for a customer's first order", async ({
  page,
  api,
}): Promise<void> => {
  await stubMyOrders(api, customerPage([]));

  await page.goto(SCREEN_URLS.CHECKOUT);

  await expect(placeOrderButton(page)).toBeEnabled();
  await expect.poll((): number => api.requests(HTTP_METHODS.GET, MY_ORDERS_PATH).length).toBe(1);
  await expectEmptyAddress(page);
  await expect(lastAddressHint(page)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("starts with an empty address, without a word, when the last order cannot be loaded", async ({
  page,
  api,
}): Promise<void> => {
  const detail: string = "Falha inesperada";
  await stubMyOrders(api, customerPage([customerSummary(LAST.number)]));
  await api.respond(
    HTTP_METHODS.GET,
    myOrderPath(LAST.id),
    problem(HTTP_INTERNAL_ERROR, "INTERNAL_ERROR", detail),
    HTTP_INTERNAL_ERROR,
  );

  await page.goto(SCREEN_URLS.CHECKOUT);

  await expect
    .poll((): number => api.requests(HTTP_METHODS.GET, myOrderPath(LAST.id)).length)
    .toBe(1);
  await expect(placeOrderButton(page)).toBeEnabled();
  await expectEmptyAddress(page);
  await expect(lastAddressHint(page)).toHaveCount(0);
  await expect(page.getByText(detail)).toHaveCount(0);
});
