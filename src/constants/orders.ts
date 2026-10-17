import type {
  ActorSide,
  BrazilianState,
  CancellationReason,
  CancellationRequestStatus,
  OrderStatus,
} from "@/@types/orders";
import type {
  CancellationFormInput,
  DecisionFormInput,
} from "@/services/validation-schemas/cancellation";
import { MS_PER_SECOND } from "./time";
import { EMPTY_TEXT } from "./validation";

export const ORDER_STATUSES = {
  RECEIVED: "RECEIVED",
  PREPARING: "PREPARING",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<OrderStatus, OrderStatus>;

export const ORDER_STATUS_LIST: readonly OrderStatus[] = Object.values(ORDER_STATUSES);

export type BoardStatus =
  | typeof ORDER_STATUSES.RECEIVED
  | typeof ORDER_STATUSES.PREPARING
  | typeof ORDER_STATUSES.OUT_FOR_DELIVERY;

export const BOARD_STATUSES: readonly BoardStatus[] = [
  ORDER_STATUSES.RECEIVED,
  ORDER_STATUSES.PREPARING,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
];

export const TRACKING_STEPS: readonly OrderStatus[] = [
  ORDER_STATUSES.RECEIVED,
  ORDER_STATUSES.PREPARING,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.RECEIVED]: "Recebido",
  [ORDER_STATUSES.PREPARING]: "Em preparo",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "Saiu para entrega",
  [ORDER_STATUSES.DELIVERED]: "Entregue",
  [ORDER_STATUSES.CANCELLED]: "Cancelado",
};

export const BOARD_COLUMN_LABELS: Record<BoardStatus, string> = {
  [ORDER_STATUSES.RECEIVED]: "Recebidos",
  [ORDER_STATUSES.PREPARING]: ORDER_STATUS_LABELS.PREPARING,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: ORDER_STATUS_LABELS.OUT_FOR_DELIVERY,
};

export const BOARD_TAB_LABELS: Record<BoardStatus, string> = {
  ...BOARD_COLUMN_LABELS,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "Saindo",
};

export const CANCELLATION_REASONS = {
  CHANGED_MIND: "CHANGED_MIND",
  ORDERED_BY_MISTAKE: "ORDERED_BY_MISTAKE",
  TAKING_TOO_LONG: "TAKING_TOO_LONG",
  OTHER: "OTHER",
  ITEM_UNAVAILABLE: "ITEM_UNAVAILABLE",
  STORE_CLOSED: "STORE_CLOSED",
  CUSTOMER_REQUEST: "CUSTOMER_REQUEST",
  DELIVERY_FAILED: "DELIVERY_FAILED",
} as const satisfies Record<CancellationReason, CancellationReason>;

export const CANCELLATION_REASON_LIST: readonly CancellationReason[] =
  Object.values(CANCELLATION_REASONS);

export const CANCELLATION_NOTE_MAX_LENGTH: number = 300;

export const EMPTY_CANCELLATION_FORM: CancellationFormInput = {
  reason: EMPTY_TEXT,
  note: EMPTY_TEXT,
};

export const EMPTY_DECISION_FORM: DecisionFormInput = { note: EMPTY_TEXT };

export const NO_CANCELLATION_CODE_FIELDS: Readonly<Partial<Record<string, never>>> = {};

export const CANCELLATION_REQUEST_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
} as const satisfies Record<CancellationRequestStatus, CancellationRequestStatus>;

export type DecidedRequestStatus = Exclude<
  CancellationRequestStatus,
  typeof CANCELLATION_REQUEST_STATUSES.PENDING
>;

export type AdvanceStatus =
  | typeof ORDER_STATUSES.PREPARING
  | typeof ORDER_STATUSES.OUT_FOR_DELIVERY
  | typeof ORDER_STATUSES.DELIVERED;

export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  [CANCELLATION_REASONS.CHANGED_MIND]: "Mudei de ideia",
  [CANCELLATION_REASONS.ORDERED_BY_MISTAKE]: "Pedi por engano",
  [CANCELLATION_REASONS.TAKING_TOO_LONG]: "Está demorando",
  [CANCELLATION_REASONS.OTHER]: "Outro motivo",
  [CANCELLATION_REASONS.ITEM_UNAVAILABLE]: "Item indisponível",
  [CANCELLATION_REASONS.STORE_CLOSED]: "Loja fechada",
  [CANCELLATION_REASONS.CUSTOMER_REQUEST]: "A pedido do cliente",
  [CANCELLATION_REASONS.DELIVERY_FAILED]: "Falha na entrega",
};

export const ACTOR_SIDES = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT: "RESTAURANT",
} as const satisfies Record<ActorSide, ActorSide>;

export const ACTOR_SIDE_LABELS: Record<ActorSide, string> = {
  [ACTOR_SIDES.CUSTOMER]: "cliente",
  [ACTOR_SIDES.RESTAURANT]: "equipe",
};

export const CANCELLED_BY_LABELS: Record<ActorSide, string> = {
  [ACTOR_SIDES.CUSTOMER]: "Cancelado pelo cliente",
  [ACTOR_SIDES.RESTAURANT]: "Cancelado pelo restaurante",
};

export const BRAZILIAN_STATES = {
  AC: "AC",
  AL: "AL",
  AP: "AP",
  AM: "AM",
  BA: "BA",
  CE: "CE",
  DF: "DF",
  ES: "ES",
  GO: "GO",
  MA: "MA",
  MT: "MT",
  MS: "MS",
  MG: "MG",
  PA: "PA",
  PB: "PB",
  PR: "PR",
  PE: "PE",
  PI: "PI",
  RJ: "RJ",
  RN: "RN",
  RS: "RS",
  RO: "RO",
  RR: "RR",
  SC: "SC",
  SP: "SP",
  SE: "SE",
  TO: "TO",
} as const satisfies Record<BrazilianState, BrazilianState>;

export const BRAZILIAN_STATE_LIST: readonly BrazilianState[] = Object.values(BRAZILIAN_STATES);

export const ZIP_CODE_DIGITS: number = 8;

export const ZIP_CODE_PREFIX_DIGITS: number = 5;

export const ZIP_CODE_SEPARATOR: string = "-";

export const STREET_MIN_LENGTH: number = 2;

export const STREET_MAX_LENGTH: number = 120;

export const ADDRESS_NUMBER_MIN_LENGTH: number = 1;

export const ADDRESS_NUMBER_MAX_LENGTH: number = 10;

export const COMPLEMENT_MAX_LENGTH: number = 60;

export const NEIGHBORHOOD_MIN_LENGTH: number = 2;

export const NEIGHBORHOOD_MAX_LENGTH: number = 60;

export const CITY_MIN_LENGTH: number = 2;

export const CITY_MAX_LENGTH: number = 60;

const LIVE_POLLING_SECONDS: number = 30;

export const LIVE_ORDER_POLLING_MS: number = LIVE_POLLING_SECONDS * MS_PER_SECOND;

export const NO_POLLING_MS: number = 0;

export const BOARD_PAGE_SIZE = 100 as const;

export const ORDER_SORT_PROPERTIES = {
  PLACED_AT: "placedAt",
  TOTAL: "total",
  NUMBER: "number",
} as const;

export type OrderSortProperty = (typeof ORDER_SORT_PROPERTIES)[keyof typeof ORDER_SORT_PROPERTIES];
