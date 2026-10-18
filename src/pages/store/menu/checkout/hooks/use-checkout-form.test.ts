import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { CustomerOrderPage } from "@/@types/orders";
import type { CheckoutFormInput } from "@/services/validation-schemas/delivery-address";
import { tokenReceived } from "@/store/slices/session";
import { customerOrder, customerPage, customerSummary, PAULISTA } from "@/test/orders";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import { EMPTY_CHECKOUT_FORM } from "../constants";
import type { CheckoutFormModel } from "../types";
import { useCheckoutForm } from "./use-checkout-form";

type FormHook = RenderHookResult<CheckoutFormModel, { empty: boolean }>;

const LAST_ORDER_ID: string = customerSummary(1042).id;

const PAULISTA_FORM: CheckoutFormInput = {
  deliveryAddress: { ...PAULISTA, complement: "Apto 42" },
};

const TWO_ORDERS: CustomerOrderPage = customerPage([customerSummary(1042), customerSummary(1031)]);

function renderForm(empty: boolean = false): FormHook {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(
    ({ empty: cartEmpty }: { empty: boolean }): CheckoutFormModel => useCheckoutForm(cartEmpty),
    {
      wrapper: withStore(store),
      initialProps: { empty },
    },
  );
}

function answerOrders(page: CustomerOrderPage): string[] {
  const opened: string[] = [];
  server.use(
    http.get(apiUrl("/my-orders"), () => HttpResponse.json(page)),
    http.get(apiUrl("/my-orders/:id"), ({ params }) => {
      opened.push(String(params.id));
      return HttpResponse.json(customerOrder(1042));
    }),
  );
  return opened;
}

function holdLastOrder(): () => void {
  let release: () => void = (): void => {};
  const released: Promise<void> = new Promise<void>((resolve: () => void): void => {
    release = resolve;
  });
  server.use(
    http.get(apiUrl("/my-orders"), () => HttpResponse.json(TWO_ORDERS)),
    http.get(apiUrl("/my-orders/:id"), async () => {
      await released;
      return HttpResponse.json(customerOrder(1042));
    }),
  );
  return release;
}

describe("useCheckoutForm", () => {
  it("fills the untouched form with the address of the customer's most recent order", async () => {
    const opened: string[] = answerOrders(TWO_ORDERS);

    const { result }: FormHook = renderForm();

    await waitFor((): void => expect(result.current.prefilled).toBe(true));
    expect(result.current.form.getValues()).toEqual(PAULISTA_FORM);
    expect(opened).toEqual([LAST_ORDER_ID]);
  });

  it("stops saying the address came from the last order once the customer edits it", async () => {
    answerOrders(TWO_ORDERS);
    const { result }: FormHook = renderForm();
    await waitFor((): void => expect(result.current.prefilled).toBe(true));

    act((): void =>
      result.current.form.setValue("deliveryAddress.number", "200", { shouldDirty: true }),
    );

    await waitFor((): void => expect(result.current.prefilled).toBe(false));
    expect(result.current.form.getValues().deliveryAddress.number).toBe("200");
  });

  it("never overwrites what the customer typed before the last address arrived", async () => {
    const release: () => void = holdLastOrder();
    const { result }: FormHook = renderForm();
    act((): void =>
      result.current.form.setValue("deliveryAddress.street", "Rua Augusta", {
        shouldDirty: true,
      }),
    );

    await act(async (): Promise<void> => {
      release();
      await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 50);
      });
    });

    expect(result.current.prefilled).toBe(false);
    expect(result.current.form.getValues()).toEqual({
      deliveryAddress: { ...EMPTY_CHECKOUT_FORM.deliveryAddress, street: "Rua Augusta" },
    });
  });

  it("leaves the form empty for a customer without orders, opening none", async () => {
    const opened: string[] = answerOrders(customerPage([]));
    const { result }: FormHook = renderForm();

    await new Promise<void>((resolve: () => void): void => {
      setTimeout(resolve, 50);
    });

    expect(result.current.prefilled).toBe(false);
    expect(result.current.form.getValues()).toEqual(EMPTY_CHECKOUT_FORM);
    expect(opened).toEqual([]);
  });

  it("leaves the form empty, without complaining, when the last order cannot be loaded", async () => {
    server.use(
      http.get(apiUrl("/my-orders"), () => HttpResponse.json(TWO_ORDERS)),
      http.get(apiUrl("/my-orders/:id"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR"), { status: 500 }),
      ),
    );
    const { result }: FormHook = renderForm();

    await new Promise<void>((resolve: () => void): void => {
      setTimeout(resolve, 50);
    });

    expect(result.current.prefilled).toBe(false);
    expect(result.current.form.getValues()).toEqual(EMPTY_CHECKOUT_FORM);
  });

  it("asks for no order while the bag is empty", () => {
    const { result }: FormHook = renderForm(true);

    expect(result.current.prefilled).toBe(false);
    expect(result.current.form.getValues()).toEqual(EMPTY_CHECKOUT_FORM);
  });
});
