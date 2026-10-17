import { expect, type Locator, type Page } from "@playwright/test";
import type { MeResponse } from "../../src/@types/me";
import type {
  CartItem,
  CartQuote,
  MenuProduct,
  MenuResponse,
  QuotedItem,
} from "../../src/@types/menu";
import { API_PATHS } from "../../src/constants/api";
import { CART_STORAGE_PREFIX } from "../../src/constants/cart";
import { MENU_MESSAGES } from "../../src/pages/store/menu/list/constants/messages";
import { HTTP_METHODS, SCREEN_URLS } from "./constants";
import type { ApiStubs, RecordedRequest } from "./fixtures";
import { CUSTOMER_ME, ME_LABELS } from "./me";
import { stubSession } from "./session";

export const MENU_PATH: string = API_PATHS.MENU;

export const QUOTE_PATH: string = API_PATHS.MENU_QUOTE;

export const SMASH: MenuProduct = {
  id: "0199f2a0-0000-7000-8000-0000000001a1",
  name: "Smash duplo",
  description: "Dois blends de 90 g, cheddar e cebola caramelizada no pão brioche.",
  price: 34.9,
};

export const FRANGO: MenuProduct = {
  id: "0199f2a0-0000-7000-8000-0000000001a2",
  name: "Frango crispy",
  description: "Sobrecoxa empanada, maionese de ervas e alface americana.",
  price: 29.9,
};

export const CALABRESA: MenuProduct = {
  id: "0199f2a0-0000-7000-8000-0000000001a3",
  name: "Calabresa",
  description: "Calabresa fatiada, cebola roxa e azeitonas. 8 fatias.",
  price: 52.9,
};

export const LIMONADA: MenuProduct = {
  id: "0199f2a0-0000-7000-8000-0000000001a4",
  name: "Limonada da casa",
  description: null,
  price: 12,
};

export const BROWNIE_ID: string = "0199f2a0-0000-7000-8000-0000000001a5";

export const BROWNIE_NAME: string = "Brownie com sorvete";

export const MENU: MenuResponse = {
  categories: [
    { id: "0199f2a0-0000-7000-8000-0000000001c1", name: "Lanches", products: [SMASH, FRANGO] },
    { id: "0199f2a0-0000-7000-8000-0000000001c2", name: "Pizzas", products: [CALABRESA] },
    { id: "0199f2a0-0000-7000-8000-0000000001c3", name: "Bebidas", products: [LIMONADA] },
  ],
};

export const OTHER_CUSTOMER_ME: MeResponse = {
  ...CUSTOMER_ME,
  user: {
    id: "0199f2a0-0000-7000-8000-000000000009",
    name: "Davi Prado",
    email: "davi@foody.dev",
  },
};

export function priced(product: MenuProduct, quantity: number, subtotal: number): QuotedItem {
  return {
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity,
    subtotal,
    available: true,
  };
}

export function unavailable(productId: string, name: string, quantity: number): QuotedItem {
  return { productId, name, quantity, available: false };
}

export function quoteOf(items: QuotedItem[], total: number): CartQuote {
  return { items, total };
}

export function itemOf(product: MenuProduct, quantity: number): CartItem {
  return { productId: product.id, quantity };
}

export async function stubMenu(api: ApiStubs, menu: MenuResponse = MENU): Promise<void> {
  await api.respond(HTTP_METHODS.GET, MENU_PATH, menu);
}

export async function stubQuote(api: ApiStubs, quote: CartQuote): Promise<void> {
  await api.respond(HTTP_METHODS.POST, QUOTE_PATH, quote);
}

export function quoteBodies(api: ApiStubs): unknown[] {
  return api
    .requests(HTTP_METHODS.POST, QUOTE_PATH)
    .map(({ body }: RecordedRequest): unknown => body);
}

export function cartStorageKey(me: MeResponse): string {
  return `${CART_STORAGE_PREFIX}${me.user.id}`;
}

export async function seedCart(page: Page, me: MeResponse, items: CartItem[]): Promise<void> {
  await page.addInitScript(
    ([key, value]: [string, string]): void => {
      localStorage.setItem(key, value);
    },
    [cartStorageKey(me), JSON.stringify(items)] as [string, string],
  );
}

export async function openMenu(
  page: Page,
  api: ApiStubs,
  me: MeResponse = CUSTOMER_ME,
  menu: MenuResponse = MENU,
): Promise<void> {
  await stubSession(api, me);
  await stubMenu(api, menu);
  await page.goto(SCREEN_URLS.MENU);
  await expect(page.getByRole("heading", { name: ME_LABELS.MENU, level: 1 })).toBeVisible();
}

export function productCard(page: Page, name: string): Locator {
  return page.getByRole("article", { name });
}

export function addButton(page: Page, name: string): Locator {
  return page.getByRole("button", { name: MENU_MESSAGES.ADD(name), exact: true });
}

export function cartBar(page: Page): Locator {
  return page.getByRole("button", { name: new RegExp(MENU_MESSAGES.VIEW_BAG) });
}

export function bag(page: Page): Locator {
  return page.getByRole("dialog", { name: MENU_MESSAGES.BAG.TITLE });
}

export function bagLine(page: Page, name: string): Locator {
  return bag(page).getByRole("listitem", { name });
}

export function bagSummary(page: Page): Locator {
  return bag(page).getByRole("group", { name: MENU_MESSAGES.BAG.SUMMARY });
}

export function continueButton(page: Page): Locator {
  return bag(page).getByRole("button", { name: MENU_MESSAGES.BAG.CONTINUE });
}

export async function openBag(page: Page): Promise<void> {
  await cartBar(page).click();
  await expect(bag(page)).toBeVisible();
}
