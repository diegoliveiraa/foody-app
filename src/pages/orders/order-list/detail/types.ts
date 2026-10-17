import type { OrderStatus, StaffOrder } from "@/@types/orders";

export interface HistoryEntryView {
  key: string;
  status: OrderStatus;
  title: string;
  detail: string;
  reason: string | null;
  note: string | null;
}

export interface StaffOrderModel {
  order: StaffOrder | undefined;
  loading: boolean;
  notFound: boolean;
  loadError: string | null;
}
