import { http, HttpResponse, type JsonBodyType } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { Category, ListProductsParams, Product, ProductPage } from "@/@types/catalog";
import type { MenuResponse } from "@/@types/menu";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "./cache-tags";
import { catalogApi } from "./catalog";
import { menuApi } from "./menu";

interface InvalidatedQuery {
  endpointName: string;
}

interface Traffic {
  categories: number;
  products: number;
  menu: number;
}

const LANCHES: Category = {
  id: "0199f2a0-0000-7000-8000-0000000000c1",
  name: "Lanches",
  displayOrder: 1,
  status: "ACTIVE",
  productCount: 1,
  disabledAt: null,
};

const SMASH: Product = {
  id: "0199f2a0-0000-7000-8000-0000000000a1",
  name: "Smash duplo",
  description: "Dois blends de 90 g",
  price: 34.9,
  category: { id: LANCHES.id, name: LANCHES.name },
  status: "ACTIVE",
  createdAt: "2026-03-04T15:00:00Z",
  disabledAt: null,
};

const PAGE: ProductPage = {
  data: [SMASH],
  meta: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
};

const MENU: MenuResponse = { categories: [] };

const FIRST_PAGE_BY_NAME: ListProductsParams = { page: 1, pageSize: 10, sort: ["name,asc"] };

function signedInStore(): TestStore {
  const testStore: TestStore = createTestStore();
  testStore.store.dispatch(tokenReceived("valid-token"));
  return testStore;
}

function countReads(): Traffic {
  const traffic: Traffic = { categories: 0, products: 0, menu: 0 };
  server.use(
    http.get(apiUrl("/catalog/categories"), () => {
      traffic.categories += 1;
      return HttpResponse.json([LANCHES]);
    }),
    http.get(apiUrl("/catalog/products"), () => {
      traffic.products += 1;
      return HttpResponse.json(PAGE);
    }),
    http.get(apiUrl("/menu"), () => {
      traffic.menu += 1;
      return HttpResponse.json(MENU);
    }),
  );
  return traffic;
}

async function openEverything({ store }: TestStore): Promise<void> {
  await Promise.all([
    store.dispatch(catalogApi.endpoints.listCategories.initiate()),
    store.dispatch(catalogApi.endpoints.listProducts.initiate(FIRST_PAGE_BY_NAME)),
    store.dispatch(menuApi.endpoints.getMenu.initiate()),
  ]);
}

function invalidatedBy({ store }: TestStore, type: CacheTag, id: string): InvalidatedQuery[] {
  return catalogApi.util.selectInvalidatedBy(store.getState(), [{ type, id }]);
}

function recordBodies(method: "post" | "put", path: string, answer: JsonBodyType): unknown[] {
  const bodies: unknown[] = [];
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      bodies.push(await request.json());
      return HttpResponse.json(answer);
    }),
  );
  return bodies;
}

describe("catalog service — categories", () => {
  it("lists every category and tags the list and each category", async () => {
    countReads();
    const testStore: TestStore = signedInStore();

    const categories: Category[] = await testStore.store
      .dispatch(catalogApi.endpoints.listCategories.initiate())
      .unwrap();

    expect(categories).toEqual([LANCHES]);
    expect(invalidatedBy(testStore, CACHE_TAGS.CATEGORY, LANCHES.id)).toEqual([
      expect.objectContaining({ endpointName: "listCategories" }),
    ]);
    expect(invalidatedBy(testStore, CACHE_TAGS.CATEGORY, LIST_ID)).toHaveLength(1);
  });

  it("creates a category with its name and display order, refreshing the list and the menu", async () => {
    const traffic: Traffic = countReads();
    const bodies: unknown[] = recordBodies("post", "/catalog/categories", LANCHES);
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store
      .dispatch(catalogApi.endpoints.createCategory.initiate({ name: "Lanches", displayOrder: 1 }))
      .unwrap();

    expect(bodies).toEqual([{ name: "Lanches", displayOrder: 1 }]);
    await vi.waitFor((): void => expect(traffic).toMatchObject({ categories: 2, menu: 2 }));
    expect(traffic.products).toBe(1);
  });

  it("updates a category with a PUT carrying only the fields, refreshing products too", async () => {
    const traffic: Traffic = countReads();
    const bodies: unknown[] = recordBodies("put", `/catalog/categories/${LANCHES.id}`, LANCHES);
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store
      .dispatch(
        catalogApi.endpoints.updateCategory.initiate({
          id: LANCHES.id,
          name: "Sanduíches",
          displayOrder: 2,
        }),
      )
      .unwrap();

    expect(bodies).toEqual([{ name: "Sanduíches", displayOrder: 2 }]);
    await vi.waitFor((): void => expect(traffic).toEqual({ categories: 2, products: 2, menu: 2 }));
  });

  it("disables and enables a category with a POST, refreshing the list and the menu", async () => {
    const traffic: Traffic = countReads();
    const calls: string[] = [];
    server.use(
      http.post(apiUrl(`/catalog/categories/${LANCHES.id}/disable`), () => {
        calls.push("disable");
        return HttpResponse.json({ ...LANCHES, status: "DISABLED" });
      }),
      http.post(apiUrl(`/catalog/categories/${LANCHES.id}/enable`), () => {
        calls.push("enable");
        return HttpResponse.json(LANCHES);
      }),
    );
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store.dispatch(catalogApi.endpoints.disableCategory.initiate(LANCHES.id));
    await testStore.store.dispatch(catalogApi.endpoints.enableCategory.initiate(LANCHES.id));

    expect(calls).toEqual(["disable", "enable"]);
    await vi.waitFor((): void => expect(traffic).toMatchObject({ categories: 3, menu: 3 }));
  });

  it("deletes a category with a DELETE answered 204", async () => {
    const methods: string[] = [];
    server.use(
      http.delete(apiUrl(`/catalog/categories/${LANCHES.id}`), ({ request }) => {
        methods.push(request.method);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { store }: TestStore = signedInStore();

    await store.dispatch(catalogApi.endpoints.deleteCategory.initiate(LANCHES.id)).unwrap();

    expect(methods).toEqual(["DELETE"]);
  });

  it("rejects with the API's code when a category still has products", async () => {
    server.use(
      http.delete(apiUrl(`/catalog/categories/${LANCHES.id}`), () =>
        HttpResponse.json(problem(409, "CATEGORY_IN_USE"), { status: 409 }),
      ),
    );
    const { store }: TestStore = signedInStore();

    const removal: Promise<null> = store
      .dispatch(catalogApi.endpoints.deleteCategory.initiate(LANCHES.id))
      .unwrap();

    await expect(removal).rejects.toMatchObject({
      status: 409,
      data: { code: "CATEGORY_IN_USE" },
    });
  });
});

describe("catalog service — products", () => {
  it("asks for the page with the search, category, status, page size and sort it was given", async () => {
    const urls: URL[] = [];
    server.use(
      http.get(apiUrl("/catalog/products"), ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json(PAGE);
      }),
    );
    const { store }: TestStore = signedInStore();

    await store.dispatch(
      catalogApi.endpoints.listProducts.initiate({
        search: "smash",
        categoryId: LANCHES.id,
        status: "DISABLED",
        page: 2,
        pageSize: 25,
        sort: ["price,desc"],
      }),
    );

    expect(Object.fromEntries(urls[0]?.searchParams ?? [])).toEqual({
      search: "smash",
      categoryId: LANCHES.id,
      status: "DISABLED",
      page: "2",
      pageSize: "25",
      sort: "price,desc",
    });
  });

  it("tags the page and each product it returned", async () => {
    countReads();
    const testStore: TestStore = signedInStore();

    await testStore.store.dispatch(catalogApi.endpoints.listProducts.initiate(FIRST_PAGE_BY_NAME));

    expect(invalidatedBy(testStore, CACHE_TAGS.PRODUCT, SMASH.id)).toEqual([
      expect.objectContaining({ endpointName: "listProducts" }),
    ]);
    expect(invalidatedBy(testStore, CACHE_TAGS.PRODUCT, "another-product")).toEqual([]);
  });

  it("creates a product with the parsed price, refreshing products, categories and the menu", async () => {
    const traffic: Traffic = countReads();
    const bodies: unknown[] = recordBodies("post", "/catalog/products", SMASH);
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store
      .dispatch(
        catalogApi.endpoints.createProduct.initiate({
          name: "Smash duplo",
          description: null,
          price: 34.9,
          categoryId: LANCHES.id,
        }),
      )
      .unwrap();

    expect(bodies).toEqual([
      { name: "Smash duplo", description: null, price: 34.9, categoryId: LANCHES.id },
    ]);
    await vi.waitFor((): void => expect(traffic).toEqual({ categories: 2, products: 2, menu: 2 }));
  });

  it("updates a product with a PUT carrying only the fields", async () => {
    const traffic: Traffic = countReads();
    const bodies: unknown[] = recordBodies("put", `/catalog/products/${SMASH.id}`, SMASH);
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store
      .dispatch(
        catalogApi.endpoints.updateProduct.initiate({
          id: SMASH.id,
          name: "Smash triplo",
          description: "Três blends",
          price: 44.9,
          categoryId: LANCHES.id,
        }),
      )
      .unwrap();

    expect(bodies).toEqual([
      { name: "Smash triplo", description: "Três blends", price: 44.9, categoryId: LANCHES.id },
    ]);
    await vi.waitFor((): void => expect(traffic).toEqual({ categories: 2, products: 2, menu: 2 }));
  });

  it("disables and enables a product with a POST, refreshing the list and the menu", async () => {
    const traffic: Traffic = countReads();
    const calls: string[] = [];
    server.use(
      http.post(apiUrl(`/catalog/products/${SMASH.id}/disable`), () => {
        calls.push("disable");
        return HttpResponse.json({ ...SMASH, status: "DISABLED" });
      }),
      http.post(apiUrl(`/catalog/products/${SMASH.id}/enable`), () => {
        calls.push("enable");
        return HttpResponse.json(SMASH);
      }),
    );
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store.dispatch(catalogApi.endpoints.disableProduct.initiate(SMASH.id));
    await testStore.store.dispatch(catalogApi.endpoints.enableProduct.initiate(SMASH.id));

    expect(calls).toEqual(["disable", "enable"]);
    await vi.waitFor((): void => expect(traffic).toMatchObject({ products: 3, menu: 3 }));
  });

  it("deletes a product, refreshing products, categories and the menu", async () => {
    const traffic: Traffic = countReads();
    server.use(
      http.delete(
        apiUrl(`/catalog/products/${SMASH.id}`),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const testStore: TestStore = signedInStore();
    await openEverything(testStore);

    await testStore.store.dispatch(catalogApi.endpoints.deleteProduct.initiate(SMASH.id)).unwrap();

    await vi.waitFor((): void => expect(traffic).toEqual({ categories: 2, products: 2, menu: 2 }));
  });

  it("rejects with the API's code when the product cannot be deleted", async () => {
    server.use(
      http.delete(apiUrl(`/catalog/products/${SMASH.id}`), () =>
        HttpResponse.json(problem(409, "PRODUCT_IN_USE"), { status: 409 }),
      ),
    );
    const { store }: TestStore = signedInStore();

    const removal: Promise<null> = store
      .dispatch(catalogApi.endpoints.deleteProduct.initiate(SMASH.id))
      .unwrap();

    await expect(removal).rejects.toMatchObject({ status: 409, data: { code: "PRODUCT_IN_USE" } });
  });
});
