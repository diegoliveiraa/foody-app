import type {
  CancellationReason,
  CustomerOrder,
  CustomerOrderPage,
  CustomerOrderSummary,
  DeliveryAddress,
  OrderStatus,
  StaffOrder,
  StaffOrderPage,
  StaffOrderSummary,
} from "@/@types/orders";
import type { PageMeta } from "@/@types/pagination";

type StaffActions = Pick<
  StaffOrderSummary,
  "allowedTransitions" | "canCancel" | "cancellationReasons"
>;

type CustomerActions = Pick<
  CustomerOrder,
  "canCancel" | "canRequestCancellation" | "cancellationReasons"
>;

const ONLY_PAGE: PageMeta = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

const DEFAULT_STATUS: OrderStatus = "RECEIVED";

export const STAFF_REASONS: readonly CancellationReason[] = [
  "ITEM_UNAVAILABLE",
  "STORE_CLOSED",
  "CUSTOMER_REQUEST",
  "OTHER",
];

export const CUSTOMER_REASONS: readonly CancellationReason[] = [
  "CHANGED_MIND",
  "ORDERED_BY_MISTAKE",
  "TAKING_TOO_LONG",
  "OTHER",
];

const NO_STAFF_ACTIONS: StaffActions = {
  allowedTransitions: [],
  canCancel: false,
  cancellationReasons: [],
};

const NO_CUSTOMER_ACTIONS: CustomerActions = {
  canCancel: false,
  canRequestCancellation: false,
  cancellationReasons: [],
};

const STAFF_ACTIONS: Record<OrderStatus, StaffActions> = {
  RECEIVED: {
    allowedTransitions: ["PREPARING"],
    canCancel: true,
    cancellationReasons: [...STAFF_REASONS],
  },
  PREPARING: {
    allowedTransitions: ["OUT_FOR_DELIVERY"],
    canCancel: true,
    cancellationReasons: [...STAFF_REASONS],
  },
  OUT_FOR_DELIVERY: {
    allowedTransitions: ["DELIVERED"],
    canCancel: true,
    cancellationReasons: ["DELIVERY_FAILED"],
  },
  DELIVERED: NO_STAFF_ACTIONS,
  CANCELLED: NO_STAFF_ACTIONS,
};

const CUSTOMER_ACTIONS: Record<OrderStatus, CustomerActions> = {
  RECEIVED: {
    canCancel: true,
    canRequestCancellation: false,
    cancellationReasons: [...CUSTOMER_REASONS],
  },
  PREPARING: {
    canCancel: false,
    canRequestCancellation: true,
    cancellationReasons: [...CUSTOMER_REASONS],
  },
  OUT_FOR_DELIVERY: NO_CUSTOMER_ACTIONS,
  DELIVERED: NO_CUSTOMER_ACTIONS,
  CANCELLED: NO_CUSTOMER_ACTIONS,
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

export function staffActionsFor(status: OrderStatus): StaffActions {
  return STAFF_ACTIONS[status];
}

export function customerActionsFor(status: OrderStatus): CustomerActions {
  return CUSTOMER_ACTIONS[status];
}

export function orderId(number: number): string {
  return `0199f2a0-0000-7000-8000-00000000${String(number).padStart(4, "0")}`;
}

export function customerOrder(number: number, changes: Partial<CustomerOrder> = {}): CustomerOrder {
  return {
    id: orderId(number),
    number,
    status: DEFAULT_STATUS,
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
    cancellationRequest: null,
    ...CUSTOMER_ACTIONS[changes.status ?? DEFAULT_STATUS],
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
    status: DEFAULT_STATUS,
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
    status: DEFAULT_STATUS,
    placedAt: "2026-10-17T22:02:00Z",
    live: true,
    customerName: "Ana Souza",
    items: [{ productName: "Smash duplo", quantity: 1 }],
    total: 34.9,
    hasPendingCancellationRequest: false,
    ...STAFF_ACTIONS[changes.status ?? DEFAULT_STATUS],
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
    status: DEFAULT_STATUS,
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
    cancellationRequest: null,
    ...STAFF_ACTIONS[changes.status ?? DEFAULT_STATUS],
    ...changes,
  };
}
