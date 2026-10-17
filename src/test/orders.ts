import type {
  CustomerOrder,
  CustomerOrderPage,
  CustomerOrderSummary,
  DeliveryAddress,
  StaffOrder,
  StaffOrderPage,
  StaffOrderSummary,
} from "@/@types/orders";
import type { PageMeta } from "@/@types/pagination";

const ONLY_PAGE: PageMeta = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

export const PAULISTA: DeliveryAddress = {
  zipCode: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

export function orderId(number: number): string {
  return `0199f2a0-0000-7000-8000-00000000${String(number).padStart(4, "0")}`;
}

export function customerOrder(number: number, changes: Partial<CustomerOrder> = {}): CustomerOrder {
  return {
    id: orderId(number),
    number,
    status: "RECEIVED",
    placedAt: "2026-10-17T22:02:00Z",
    live: true,
    items: [
      {
        productId: "0199f2a0-0000-7000-8000-0000000000a1",
        productName: "Smash duplo",
        unitPrice: 34.9,
        quantity: 1,
        subtotal: 34.9,
      },
    ],
    total: 34.9,
    deliveryAddress: PAULISTA,
    history: [
      {
        fromStatus: null,
        toStatus: "RECEIVED",
        actorSide: "CUSTOMER",
        occurredAt: "2026-10-17T22:02:00Z",
      },
    ],
    cancellation: null,
    ...changes,
  };
}

export function customerSummary(
  number: number,
  changes: Partial<CustomerOrderSummary> = {},
): CustomerOrderSummary {
  return {
    id: orderId(number),
    number,
    status: "RECEIVED",
    placedAt: "2026-10-17T22:02:00Z",
    live: true,
    items: [{ productName: "Smash duplo", quantity: 1 }],
    total: 34.9,
    ...changes,
  };
}

export function customerPage(
  orders: readonly CustomerOrderSummary[],
  meta: Partial<PageMeta> = {},
): CustomerOrderPage {
  return { data: [...orders], meta: { ...ONLY_PAGE, totalItems: orders.length, ...meta } };
}

export function staffSummary(
  number: number,
  changes: Partial<StaffOrderSummary> = {},
): StaffOrderSummary {
  return {
    id: orderId(number),
    number,
    status: "RECEIVED",
    placedAt: "2026-10-17T22:02:00Z",
    live: true,
    customerName: "Ana Souza",
    items: [{ productName: "Smash duplo", quantity: 1 }],
    total: 34.9,
    ...changes,
  };
}

export function staffPage(
  orders: readonly StaffOrderSummary[],
  meta: Partial<PageMeta> = {},
): StaffOrderPage {
  return { data: [...orders], meta: { ...ONLY_PAGE, totalItems: orders.length, ...meta } };
}

export function staffOrder(number: number, changes: Partial<StaffOrder> = {}): StaffOrder {
  return {
    id: orderId(number),
    number,
    status: "RECEIVED",
    placedAt: "2026-10-17T22:02:00Z",
    live: true,
    customer: {
      id: "0199f2a0-0000-7000-8000-000000000001",
      name: "Ana Souza",
      email: "ana@foody.dev",
    },
    items: [
      {
        productId: "0199f2a0-0000-7000-8000-0000000000a1",
        productName: "Smash duplo",
        unitPrice: 34.9,
        quantity: 1,
        subtotal: 34.9,
      },
    ],
    total: 34.9,
    deliveryAddress: PAULISTA,
    history: [
      {
        fromStatus: null,
        toStatus: "RECEIVED",
        actorSide: "CUSTOMER",
        actorName: "Ana Souza",
        occurredAt: "2026-10-17T22:02:00Z",
      },
    ],
    cancellation: null,
    ...changes,
  };
}
