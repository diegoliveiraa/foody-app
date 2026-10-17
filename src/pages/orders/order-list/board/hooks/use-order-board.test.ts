import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { StaffOrderSummary } from "@/@types/orders";
import { tokenReceived } from "@/store/slices/session";
import { staffPage, staffSummary } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { BoardColumn, OrderBoardModel } from "../types";
import { useOrderBoard } from "./use-order-board";

vi.mock("sonner", () => ({ toast: vi.fn() }));

function renderBoard(): RenderHookResult<OrderBoardModel, unknown> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useOrderBoard, { wrapper: withStore(store) });
}

function countReads(): () => number {
  let reads: number = 0;
  server.use(
    http.get(apiUrl("/orders"), () => {
      reads += 1;
      return HttpResponse.json(
        staffPage([staffSummary(1043), staffSummary(1042, { status: "PREPARING" })]),
      );
    }),
  );
  return (): number => reads;
}

describe("useOrderBoard", () => {
  it("splits the board by status and remembers when it was last updated", async () => {
    countReads();

    const { result }: RenderHookResult<OrderBoardModel, unknown> = renderBoard();

    await waitFor((): void => expect(result.current.loading).toBe(false));
    expect(
      result.current.columns.map((column: BoardColumn): number[] =>
        column.orders.map((order: StaffOrderSummary): number => order.number),
      ),
    ).toEqual([[1043], [1042], []]);
    expect(result.current.updatedAt).toEqual(expect.any(Number));
    expect(result.current.pendingRequests).toBeNull();
  });

  it("tells how many customers wait for a cancellation answer and which order came first", async () => {
    const waiting: StaffOrderSummary = staffSummary(1042, {
      status: "PREPARING",
      hasPendingCancellationRequest: true,
      allowedTransitions: [],
      canCancel: false,
      cancellationReasons: [],
    });
    server.use(
      http.get(apiUrl("/orders"), () =>
        HttpResponse.json(staffPage([waiting, staffSummary(1043)])),
      ),
    );

    const { result }: RenderHookResult<OrderBoardModel, unknown> = renderBoard();

    await waitFor((): void =>
      expect(result.current.pendingRequests).toEqual({ count: 1, oldest: waiting }),
    );
  });

  it("asks for the board again when reloaded", async () => {
    const reads: () => number = countReads();
    const { result }: RenderHookResult<OrderBoardModel, unknown> = renderBoard();
    await waitFor((): void => expect(reads()).toBe(1));

    result.current.reload();

    await waitFor((): void => expect(reads()).toBe(2));
  });

  it("tells why the board could not be loaded", async () => {
    server.use(
      http.get(apiUrl("/orders"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );

    const { result }: RenderHookResult<OrderBoardModel, unknown> = renderBoard();

    await waitFor((): void => expect(result.current.loadError).toBe("Erro inesperado"));
    expect(result.current.updatedAt).toBeNull();
  });
});
