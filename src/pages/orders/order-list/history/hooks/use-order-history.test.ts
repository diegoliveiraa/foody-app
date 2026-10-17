import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { tokenReceived } from "@/store/slices/session";
import { staffPage, staffSummary } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { OrderHistoryModel } from "../types";
import { useOrderHistory } from "./use-order-history";

type SentQuery = Record<string, string>;

const FIRST_PAGE_QUERY: SentQuery = { page: "1", pageSize: "10", sort: "placedAt,desc" };

function recordQueries(): SentQuery[] {
  const queries: SentQuery[] = [];
  server.use(
    http.get(apiUrl("/orders"), ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json(
        staffPage([staffSummary(1042, { status: "DELIVERED" })], { hasNext: true }),
      );
    }),
  );
  return queries;
}

function renderHistory(): RenderHookResult<OrderHistoryModel, unknown> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useOrderHistory, { wrapper: withStore(store) });
}

describe("useOrderHistory", () => {
  it("asks for page 1 again with the chosen status and dates", async () => {
    const queries: SentQuery[] = recordQueries();
    const { result }: RenderHookResult<OrderHistoryModel, unknown> = renderHistory();
    await waitFor((): void => expect(queries).toHaveLength(1));
    act((): void => result.current.actions.changePage(2));
    await waitFor((): void => expect(queries).toHaveLength(2));

    act((): void => result.current.actions.changeStatus("DELIVERED"));
    act((): void => result.current.actions.changeFrom("2026-10-01"));
    act((): void => result.current.actions.changeTo("2026-10-17"));

    await waitFor((): void =>
      expect(queries).toContainEqual({
        ...FIRST_PAGE_QUERY,
        status: "DELIVERED",
        from: "2026-10-01",
        to: "2026-10-17",
      }),
    );
    expect(queries[1]).toEqual({ ...FIRST_PAGE_QUERY, page: "2" });
    expect(result.current.hasFilters).toBe(true);
  });

  it("tells why the history could not be loaded and shows no pagination", async () => {
    server.use(
      http.get(apiUrl("/orders"), () =>
        HttpResponse.json(problem(403, "FORBIDDEN", "Sem permissão"), { status: 403 }),
      ),
    );

    const { result }: RenderHookResult<OrderHistoryModel, unknown> = renderHistory();

    await waitFor((): void => expect(result.current.loadError).toBe("Sem permissão"));
    expect(result.current.pagination).toBeNull();
  });
});
