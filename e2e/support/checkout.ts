import type { Locator, Page } from "@playwright/test";
import { CHECKOUT_MESSAGES } from "../../src/pages/store/menu/checkout/constants/messages";
import type { CheckoutFormInput } from "../../src/services/validation-schemas/delivery-address";
import { chooseOption } from "./select";

export type TypedAddress = CheckoutFormInput["deliveryAddress"];

export const TYPED_PAULISTA: TypedAddress = {
  zipCode: "01310100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

export function addressField(page: Page, label: string): Locator {
  return page.getByLabel(label, { exact: true });
}

export async function fillDeliveryAddress(
  page: Page,
  address: TypedAddress = TYPED_PAULISTA,
): Promise<void> {
  await addressField(page, CHECKOUT_MESSAGES.ZIP_CODE).clear();
  await addressField(page, CHECKOUT_MESSAGES.ZIP_CODE).pressSequentially(address.zipCode);
  await addressField(page, CHECKOUT_MESSAGES.STREET).fill(address.street);
  await addressField(page, CHECKOUT_MESSAGES.NUMBER).fill(address.number);
  await addressField(page, CHECKOUT_MESSAGES.COMPLEMENT).fill(address.complement);
  await addressField(page, CHECKOUT_MESSAGES.NEIGHBORHOOD).fill(address.neighborhood);
  await addressField(page, CHECKOUT_MESSAGES.CITY).fill(address.city);
  await chooseOption(page, addressField(page, CHECKOUT_MESSAGES.STATE), address.state);
}

export function placeOrderButton(page: Page): Locator {
  return page.getByRole("button", { name: new RegExp(CHECKOUT_MESSAGES.PLACE) });
}

export function checkoutSummary(page: Page): Locator {
  return page.getByRole("region", { name: CHECKOUT_MESSAGES.SUMMARY });
}

export function lastAddressHint(page: Page): Locator {
  return page.getByText(CHECKOUT_MESSAGES.LAST_ADDRESS);
}
