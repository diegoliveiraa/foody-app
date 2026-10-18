import type { CustomerOrder } from "../../../src/@types/orders";
import { MESSAGES } from "../../../src/constants/messages";
import { CHECKOUT_MESSAGES } from "../../../src/pages/store/menu/checkout/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import {
  addressField,
  checkoutSummary,
  fillDeliveryAddress,
  placeOrderButton,
} from "../../support/checkout";
import { HTTP_CREATED, HTTP_METHODS, SCREEN_URLS } from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow, pathIs } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  cartStorageKey,
  itemOf,
  LIMONADA,
  priced,
  quoteOf,
  seedCart,
  SMASH,
  stubQuote,
} from "../../support/menu";
import { sentBodies } from "../../support/catalog";
import {
  customerOrder,
  customerPage,
  MY_ORDERS_PATH,
  myOrderUrl,
  PAULISTA,
  stubMyOrder,
  stubMyOrders,
} from "../../support/orders";
import { stubSession } from "../../support/session";

const PLACED: CustomerOrder = customerOrder(1042, {
  items: [
    {
      productId: SMASH.id,
      productName: SMASH.name,
      unitPrice: 34.9,
      quantity: 1,
      subtotal: 34.9,
    },
    {
      productId: LIMONADA.id,
      productName: LIMONADA.name,
      unitPrice: 12,
      quantity: 2,
      subtotal: 24,
    },
  ],
  total: 58.9,
});

test.beforeEach(async ({ page, api }): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1), itemOf(LIMONADA, 2)]);
  await stubSession(api, CUSTOMER_ME);
  await stubMyOrders(api, customerPage([]));
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9), priced(LIMONADA, 2, 24)], 58.9));
});

test("sums up the bag with the lines and total the API quoted, on the button too", async ({
  page,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.CHECKOUT);

  await expect(page.getByRole("heading", { name: CHECKOUT_MESSAGES.TITLE })).toBeVisible();
  await expect(checkoutSummary(page)).toContainText(
    `${MESSAGES.ORDERS.ITEM_LINE(1, SMASH.name)}${formatMoney(34.9)}`,
  );
  await expect(checkoutSummary(page)).toContainText(
    `${MESSAGES.ORDERS.ITEM_LINE(2, LIMONADA.name)}${formatMoney(24)}`,
  );
  await expect(checkoutSummary(page)).toContainText(formatMoney(58.9));
  await expect(placeOrderButton(page)).toContainText(formatMoney(58.9));
  await expect(placeOrderButton(page)).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test("masks the CEP while it is typed", async ({ page }): Promise<void> => {
  await page.goto(SCREEN_URLS.CHECKOUT);

  await addressField(page, CHECKOUT_MESSAGES.ZIP_CODE).pressSequentially("01310100");

  await expect(addressField(page, CHECKOUT_MESSAGES.ZIP_CODE)).toHaveValue("01310-100");
  await expect(addressField(page, CHECKOUT_MESSAGES.ZIP_CODE)).toHaveAttribute(
    "inputmode",
    "numeric",
  );
});

test("places the order with the bag's items and the address, empties the bag and opens the tracking", async ({
  page,
  api,
}): Promise<void> => {
  await api.respond(HTTP_METHODS.POST, MY_ORDERS_PATH, PLACED, HTTP_CREATED);
  await stubMyOrder(api, PLACED);
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(placeOrderButton(page)).toBeEnabled();
  await fillDeliveryAddress(page);

  await placeOrderButton(page).click();

  await expect(page).toHaveURL(pathIs(myOrderUrl(PLACED.id)));
  await expect(page.getByText(CHECKOUT_MESSAGES.PLACED(PLACED.number))).toBeVisible();
  await expect(
    page.getByRole("heading", { name: MESSAGES.ORDERS.TITLE(PLACED.number) }),
  ).toBeVisible();
  expect(sentBodies(api, HTTP_METHODS.POST, MY_ORDERS_PATH)).toEqual([
    {
      items: [itemOf(SMASH, 1), itemOf(LIMONADA, 2)],
      deliveryAddress: PAULISTA,
    },
  ]);
  await expect
    .poll((): Promise<string | null> =>
      page.evaluate(
        (key: string): string | null => localStorage.getItem(key),
        cartStorageKey(CUSTOMER_ME),
      ),
    )
    .toBe("[]");
  await expectNoHorizontalOverflow(page);
});
