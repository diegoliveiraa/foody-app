import { expect, type Locator, type Page } from "@playwright/test";
import type { Category, Product, ProductPage } from "../../src/@types/catalog";
import type { PageMeta } from "../../src/@types/pagination";
import { API_PATHS } from "../../src/constants/api";
import { MESSAGES } from "../../src/constants/messages";
import { HTTP_METHODS, SCREEN_URLS, type HttpMethod } from "./constants";
import type { ApiStubs, RecordedRequest } from "./fixtures";
import { showsListCards } from "./layout";
import { STAFF_ME } from "./me";
import { stubSession } from "./session";

export const PRODUCTS_PATH: string = API_PATHS.CATALOG_PRODUCTS;

export const CATEGORIES_PATH: string = API_PATHS.CATALOG_CATEGORIES;

const FIRST_PAGE_META: PageMeta = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

export const LANCHES: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c1",
  name: "Lanches",
  displayOrder: 1,
  status: "ACTIVE",
  productCount: 2,
  disabledAt: null,
};

export const PIZZAS: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c2",
  name: "Pizzas",
  displayOrder: 2,
  status: "ACTIVE",
  productCount: 1,
  disabledAt: null,
};

export const SOBREMESAS: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c3",
  name: "Sobremesas",
  displayOrder: 3,
  status: "DISABLED",
  productCount: 0,
  disabledAt: "2026-05-01T15:00:00Z",
};

export const EVERY_CATEGORY: readonly Category[] = [LANCHES, PIZZAS, SOBREMESAS];

export const SMASH: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a1",
  name: "Smash duplo",
  description: "Dois blends de 90 g, cheddar e cebola caramelizada.",
  price: 34.9,
  category: { id: LANCHES.id, name: LANCHES.name },
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

export const CALABRESA: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a2",
  name: "Calabresa",
  description: null,
  price: 52.9,
  category: { id: PIZZAS.id, name: PIZZAS.name },
  status: "ACTIVE",
  createdAt: "2026-02-10T15:00:00Z",
  disabledAt: null,
};

export const FRANGO: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a3",
  name: "Frango crispy",
  description: null,
  price: 29.9,
  category: { id: LANCHES.id, name: LANCHES.name },
  status: "DISABLED",
  createdAt: "2026-01-15T15:00:00Z",
  disabledAt: "2026-04-01T15:00:00Z",
};

export const EVERY_PRODUCT: readonly Product[] = [CALABRESA, FRANGO, SMASH];

export function productsPage(
  products: readonly Product[],
  meta: Partial<PageMeta> = {},
): ProductPage {
  return {
    data: [...products],
    meta: { ...FIRST_PAGE_META, totalItems: products.length, ...meta },
  };
}

export async function stubCategories(
  api: ApiStubs,
  categories: readonly Category[] = EVERY_CATEGORY,
): Promise<void> {
  await api.respond(HTTP_METHODS.GET, CATEGORIES_PATH, categories);
}

export async function stubProducts(api: ApiStubs, page: ProductPage): Promise<void> {
  await api.respond(HTTP_METHODS.GET, PRODUCTS_PATH, page);
}

export async function stubProductsWith(api: ApiStubs, changed: Product): Promise<void> {
  await stubProducts(
    api,
    productsPage(
      EVERY_PRODUCT.map((product: Product): Product =>
        product.id === changed.id ? changed : product,
      ),
    ),
  );
}

export async function stubCategoriesWith(api: ApiStubs, changed: Category): Promise<void> {
  await stubCategories(
    api,
    EVERY_CATEGORY.map((category: Category): Category =>
      category.id === changed.id ? changed : category,
    ),
  );
}

export function productQueries(api: ApiStubs): Record<string, string>[] {
  return api
    .requests(HTTP_METHODS.GET, PRODUCTS_PATH)
    .map((request: RecordedRequest): Record<string, string> =>
      Object.fromEntries(request.url.searchParams),
    );
}

export function sentBodies(api: ApiStubs, method: HttpMethod, path: string): unknown[] {
  return api.requests(method, path).map(({ body }: RecordedRequest): unknown => body);
}

export function entryOf(page: Page, name: string): Locator {
  if (showsListCards(page)) {
    return page.getByRole("article", { name });
  }
  return page.getByRole("row").filter({ hasText: name });
}

export async function chooseRowAction(page: Page, name: string, action: string): Promise<void> {
  await entryOf(page, name)
    .getByRole("button", { name: MESSAGES.ACTIONS.FOR(name) })
    .click();
  await page.getByRole("menuitem", { name: action }).click();
}

export async function openProductsScreen(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await stubProducts(api, productsPage(EVERY_PRODUCT));
  await page.goto(SCREEN_URLS.PRODUCTS);
  await expect(entryOf(page, SMASH.name)).toBeVisible();
}

export async function openCategoriesScreen(page: Page, api: ApiStubs): Promise<void> {
  await stubSession(api, STAFF_ME);
  await stubCategories(api);
  await page.goto(SCREEN_URLS.CATEGORIES);
  await expect(entryOf(page, LANCHES.name)).toBeVisible();
}
