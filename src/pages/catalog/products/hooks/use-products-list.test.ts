import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { ProductPage } from "@/@types/catalog";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { ProductsListModel } from "../types";
import { useProductsList } from "./use-products-list";

type SentQuery = Record<string, string>;

const LANCHES_ID: string = "0199f2a0-0000-7000-8000-0000000000c1";

const PAGE: ProductPage = {
  data: [],
  meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1, hasNext: true, hasPrevious: false },
};

const FIRST_PAGE_QUERY: SentQuery = { page: "1", pageSize: "10", sort: "name,asc" };

function recordListQueries(): SentQuery[] {
  const queries: SentQuery[] = [];
  server.use(
    http.get(apiUrl("/catalog/products"), ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json(PAGE);
    }),
  );
  return queries;
}

function renderList(): RenderHookResult<ProductsListModel, unknown> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useProductsList, { wrapper: withStore(store) });
}

describe("useProductsList", () => {
  it("asks for page 1 again with the chosen category and status", async () => {
    const queries: SentQuery[] = recordListQueries();
    const { result }: RenderHookResult<ProductsListModel, unknown> = renderList();
    await waitFor((): void => expect(queries).toHaveLength(1));
    act((): void => result.current.actions.changePage(2));
    await waitFor((): void => expect(queries).toHaveLength(2));

    act((): void => result.current.actions.changeCategory(LANCHES_ID));
    act((): void => result.current.actions.changeStatus("ACTIVE"));

    await waitFor((): void =>
      expect(queries).toContainEqual({
        ...FIRST_PAGE_QUERY,
        categoryId: LANCHES_ID,
        status: "ACTIVE",
      }),
    );
    expect(queries[1]).toEqual({ ...FIRST_PAGE_QUERY, page: "2" });
    expect(result.current.hasFilters).toBe(true);
  });

  it("tells why the products could not be loaded and shows no pagination", async () => {
    server.use(
      http.get(apiUrl("/catalog/products"), () =>
        HttpResponse.json(problem(403, "FORBIDDEN", "Sem permissão"), { status: 403 }),
      ),
    );

    const { result }: RenderHookResult<ProductsListModel, unknown> = renderList();

    await waitFor((): void => expect(result.current.loadError).toBe("Sem permissão"));
    expect(result.current.pagination).toBeNull();
  });
});
