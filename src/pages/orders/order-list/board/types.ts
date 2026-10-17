import type { StaffOrderSummary } from "@/@types/orders";
import type { BoardStatus } from "@/constants/orders";

export interface BoardColumn {
  status: BoardStatus;
  orders: readonly StaffOrderSummary[];
  showsCancel: boolean;
}

export interface OrderBoardModel {
  columns: readonly BoardColumn[];
  loading: boolean;
  loadError: string | null;
  refreshing: boolean;
  updatedAt: number | null;
  pendingRequests: PendingRequests | null;
  reload: () => void;
}

export interface PendingRequests {
  count: number;
  oldest: StaffOrderSummary;
}
