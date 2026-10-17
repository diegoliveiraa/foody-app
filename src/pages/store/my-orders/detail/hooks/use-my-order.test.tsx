import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { JSX, ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import type { CustomerOrder } from "@/@types/orders";
import type { AppStore } from "@/store";
import { tokenReceived } from "@/store/slices/session";
import { customerOrder, orderId } from "@/test/orders";
import { problem } from "@/test/problems";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { MyOrderModel } from "../types";
import { useMyOrder } from "./use-my-order";

interface WrapperProps {
  children: ReactNode;
}

function atOrder(store: AppStore, id: string): (props: WrapperProps) => JSX.Element {
  return function OrderRoute({ children }: WrapperProps): JSX.Element {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/my-orders/${id}`]}>
          <Routes>
            <Route path="/my-orders/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };
}

function renderOrder(id: string): RenderHookResult<MyOrderModel, unknown> {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useMyOrder, { wrapper: atOrder(store, id) });
}

describe("useMyOrder", () => {
  it("reads the customer's order named in the address", async () => {
    const order: CustomerOrder = customerOrder(1042);
    server.use(http.get(apiUrl(`/my-orders/${order.id}`), () => HttpResponse.json(order)));

    const { result }: RenderHookResult<MyOrderModel, unknown> = renderOrder(order.id);

    await waitFor((): void => expect(result.current.order).toEqual(order));
    expect(result.current.notFound).toBe(false);
  });

  it("reports an order that is not the customer's as not found, without an error message", async () => {
    const unknown: string = orderId(9999);
    server.use(
      http.get(apiUrl(`/my-orders/${unknown}`), () =>
        HttpResponse.json(problem(404, "ORDER_NOT_FOUND", "Pedido não encontrado"), {
          status: 404,
        }),
      ),
    );

    const { result }: RenderHookResult<MyOrderModel, unknown> = renderOrder(unknown);

    await waitFor((): void => expect(result.current.notFound).toBe(true));
    expect(result.current.loadError).toBeNull();
  });

  it("tells why any other failure happened", async () => {
    const id: string = orderId(1042);
    server.use(
      http.get(apiUrl(`/my-orders/${id}`), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );

    const { result }: RenderHookResult<MyOrderModel, unknown> = renderOrder(id);

    await waitFor((): void => expect(result.current.loadError).toBe("Erro inesperado"));
    expect(result.current.notFound).toBe(false);
  });
});
