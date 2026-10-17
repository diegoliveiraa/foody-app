import type { PageMeta } from "@/@types/pagination";
import type { StaffOrderSummary } from "@/@types/orders";
import type { HistoryFilterModel } from "./filter/types";

export interface OrderHistoryModel extends HistoryFilterModel {
  orders: readonly StaffOrderSummary[];
  pagination: PageMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadError: string | null;
}
