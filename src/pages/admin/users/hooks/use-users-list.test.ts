import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { AdminUserPage } from "@/@types/users";
import { tokenReceived } from "@/store/slices/session";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import type { UsersListModel } from "../types";
import { useUsersList } from "./use-users-list";

type SentQuery = Record<string, string>;

const SETTLE_TIMEOUT_MS: number = 3_000;

const SETTLE_MARGIN_MS: number = 200;

const PAGE: AdminUserPage = {
  data: [],
  meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1, hasNext: true, hasPrevious: false },
};

const FIRST_PAGE_QUERY: SentQuery = { page: "1", pageSize: "10", sort: "name,asc" };

function recordListQueries(): SentQuery[] {
  const queries: SentQuery[] = [];
  server.use(
    http.get(apiUrl("/admin/users"), ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json(PAGE);
    }),
  );
  return queries;
}

function renderList(): RenderHookResult<UsersListModel, unknown> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useUsersList, { wrapper: withStore(store) });
}

describe("useUsersList", () => {
  it("asks for page 1 of the new search only once the typing settles, never for the old one", async () => {
    const queries: SentQuery[] = recordListQueries();
    const { result }: RenderHookResult<UsersListModel, unknown> = renderList();
    await waitFor((): void => expect(queries).toHaveLength(1));
    act((): void => result.current.actions.changePage(2));
    await waitFor((): void => expect(queries).toHaveLength(2));

    act((): void => result.current.actions.changeSearch("a"));
    act((): void => result.current.actions.changeSearch("an"));
    act((): void => result.current.actions.changeSearch("ana"));
    const whileTyping: number = result.current.filter.page;

    await waitFor(
      (): void => expect(queries).toContainEqual({ ...FIRST_PAGE_QUERY, search: "ana" }),
      { timeout: SETTLE_TIMEOUT_MS },
    );
    expect(whileTyping).toBe(2);
    expect(queries).toEqual([
      FIRST_PAGE_QUERY,
      { ...FIRST_PAGE_QUERY, page: "2" },
      { ...FIRST_PAGE_QUERY, search: "ana" },
    ]);
    expect(result.current.filter.page).toBe(1);
  });

  it("clears the search at once and does not bring the old one back when it settles", async () => {
    const queries: SentQuery[] = recordListQueries();
    const { result }: RenderHookResult<UsersListModel, unknown> = renderList();
    act((): void => result.current.actions.changeSearch("ana"));
    await waitFor(
      (): void => expect(queries).toContainEqual({ ...FIRST_PAGE_QUERY, search: "ana" }),
      { timeout: SETTLE_TIMEOUT_MS },
    );

    act((): void => result.current.actions.clearFilters());
    await act(async (): Promise<void> => {
      await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, SEARCH_DEBOUNCE_MS + SETTLE_MARGIN_MS);
      });
    });

    expect(result.current.filter).toMatchObject({ search: "", appliedSearch: "" });
    expect(result.current.hasFilters).toBe(false);
    expect(queries).toEqual([FIRST_PAGE_QUERY, { ...FIRST_PAGE_QUERY, search: "ana" }]);
  });
});
