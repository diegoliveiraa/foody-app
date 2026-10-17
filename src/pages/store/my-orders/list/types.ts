import type { CustomerOrderSummary } from "@/@types/orders";

export interface MyOrdersModel {
  orders: readonly CustomerOrderSummary[];
  loading: boolean;
  loadError: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}
