import type { CustomerOrder, OrderStatus } from "@/@types/orders";
import type { STEP_STATES } from "./constants";

export type StepState = (typeof STEP_STATES)[keyof typeof STEP_STATES];

export interface TrackingStep {
  status: OrderStatus;
  state: StepState;
  reachedAt: string | null;
}

export interface MyOrderModel {
  order: CustomerOrder | undefined;
  loading: boolean;
  notFound: boolean;
  loadError: string | null;
}
