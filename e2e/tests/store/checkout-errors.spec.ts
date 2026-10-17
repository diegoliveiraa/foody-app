import { MESSAGES } from "../../../src/constants/messages";
import { CHECKOUT_MESSAGES } from "../../../src/pages/store/menu/checkout/constants/messages";
import { formatMoney } from "../../../src/utils/format-money";
import {
  addressField,
  checkoutSummary,
  fillDeliveryAddress,
  placeOrderButton,
} from "../../support/checkout";
import {
  HTTP_BAD_REQUEST,
  HTTP_METHODS,
  HTTP_UNPROCESSABLE,
  SCREEN_URLS,
} from "../../support/constants";
import { expect, test } from "../../support/fixtures";
import { expectNoHorizontalOverflow } from "../../support/layout";
import { CUSTOMER_ME } from "../../support/me";
import {
  itemOf,
  LIMONADA,
  priced,
  quoteBodies,
  quoteOf,
  seedCart,
  SMASH,
  stubQuote,
  unavailable,
} from "../../support/menu";
import { MY_ORDERS_PATH } from "../../support/orders";
import { problem } from "../../support/problems";
import { stubSession } from "../../support/session";

const ZIP_CODE_REFUSED: string = "CEP inválido. Use o formato 00000-000";

const STREET_REFUSED: string = "A rua não pode ter só espaços";

const UNAVAILABLE_DETAIL: string = "Um ou mais produtos não estão mais disponíveis: Smash duplo";

test.beforeEach(async ({ page, api }): Promise<void> => {
  await seedCart(page, CUSTOMER_ME, [itemOf(SMASH, 1), itemOf(LIMONADA, 2)]);
  await stubSession(api, CUSTOMER_ME);
  await stubQuote(api, quoteOf([priced(SMASH, 1, 34.9), priced(LIMONADA, 2, 24)], 58.9));
});

test("asks for a complete address before sending anything", async ({
  page,
  api,
}): Promise<void> => {
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(placeOrderButton(page)).toBeEnabled();

  await placeOrderButton(page).click();

  await expect(page.getByText(MESSAGES.VALIDATION.ZIP_CODE_INVALID)).toBeVisible();
  await expect(page.getByText(MESSAGES.VALIDATION.STREET_LENGTH)).toBeVisible();
  await expect(page.getByText(MESSAGES.VALIDATION.STATE_REQUIRED)).toBeVisible();
  expect(api.requests(HTTP_METHODS.POST, MY_ORDERS_PATH)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

test("puts the API's refusals on the address fields they belong to", async ({
  page,
  api,
}): Promise<void> => {
  await api.respond(
    HTTP_METHODS.POST,
    MY_ORDERS_PATH,
    problem(HTTP_BAD_REQUEST, "VALIDATION_FAILED", "Dados inválidos", [
      { field: "deliveryAddress.zipCode", message: ZIP_CODE_REFUSED },
      { field: "deliveryAddress.street", message: STREET_REFUSED },
    ]),
    HTTP_BAD_REQUEST,
  );
  await page.goto(SCREEN_URLS.CHECKOUT);
  await fillDeliveryAddress(page);

  await placeOrderButton(page).click();

  await expect(page.getByText(ZIP_CODE_REFUSED)).toBeVisible();
  await expect(page.getByText(STREET_REFUSED)).toBeVisible();
  await expect(addressField(page, CHECKOUT_MESSAGES.ZIP_CODE)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(placeOrderButton(page)).toBeEnabled();
  await expectNoHorizontalOverflow(page);
});

test("prices the bag again when a product left the menu, and holds the order until it is removed", async ({
  page,
  api,
}): Promise<void> => {
  await api.respond(
    HTTP_METHODS.POST,
    MY_ORDERS_PATH,
    problem(HTTP_UNPROCESSABLE, "PRODUCT_UNAVAILABLE", UNAVAILABLE_DETAIL),
    HTTP_UNPROCESSABLE,
  );
  await page.goto(SCREEN_URLS.CHECKOUT);
  await expect(checkoutSummary(page)).toContainText(formatMoney(58.9));
  await stubQuote(
    api,
    quoteOf([unavailable(SMASH.id, SMASH.name, 1), priced(LIMONADA, 2, 24)], 24),
  );
  await fillDeliveryAddress(page);

  await placeOrderButton(page).click();

  await expect(page.getByText(UNAVAILABLE_DETAIL)).toBeVisible();
  await expect.poll((): number => quoteBodies(api).length).toBe(2);
  await expect(checkoutSummary(page)).toContainText(CHECKOUT_MESSAGES.UNAVAILABLE);
  await expect(page.getByText(CHECKOUT_MESSAGES.UNAVAILABLE_NOTICE)).toBeVisible();
  await expect(placeOrderButton(page)).toBeDisabled();
  await expectNoHorizontalOverflow(page);
});
