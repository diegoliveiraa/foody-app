import type {
  Dashboard,
  DashboardActiveOrders,
  DashboardPendingRequest,
  DashboardPendingRequests,
  DashboardTopProduct,
} from "@/@types/dashboard";
import { BOARD_STATUSES, BOARD_TAB_LABELS, type BoardStatus } from "@/constants/orders";
import { formatMoney } from "@/utils/format-money";
import { formatCount } from "@/utils/format-number";
import { formatZonedClock } from "@/utils/format-zoned-date";
import { ACTIVE_COUNT_FIELDS, FIRST_RANK, NOTHING_COUNTED } from "../constants";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { ActiveCount, DashboardView, PendingBanner, TopProductRow } from "../types";
import { toKpiCards } from "./kpi-cards";
import { toCancellationsView, toStageRows } from "./meter-rows";
import { toOrdersChart } from "./orders-chart";

function toPendingBanner({ count, items }: DashboardPendingRequests): PendingBanner | null {
  const oldest: DashboardPendingRequest | undefined = items[0];
  if (count <= NOTHING_COUNTED || oldest === undefined) {
    return null;
  }
  return { label: DASHBOARD_MESSAGES.PENDING_REQUESTS(count), orderId: oldest.orderId };
}

function toActiveCounts(active: DashboardActiveOrders): ActiveCount[] {
  return BOARD_STATUSES.map((status: BoardStatus): ActiveCount => ({
    status,
    label: BOARD_TAB_LABELS[status],
    count: formatCount(active[ACTIVE_COUNT_FIELDS[status]]),
  }));
}

function toTopProducts(products: readonly DashboardTopProduct[]): TopProductRow[] {
  return products.map((product: DashboardTopProduct, index: number): TopProductRow => ({
    productId: product.productId,
    rank: index + FIRST_RANK,
    name: product.name,
    units: DASHBOARD_MESSAGES.UNITS(product.quantity),
    revenue: formatMoney(product.revenue),
  }));
}

export function toDashboardView(dashboard: Dashboard): DashboardView {
  return {
    updatedAt: DASHBOARD_MESSAGES.UPDATED_AT(
      formatZonedClock(dashboard.generatedAt, dashboard.timeZone),
    ),
    kpis: toKpiCards(dashboard),
    pending: toPendingBanner(dashboard.pendingCancellationRequests),
    active: toActiveCounts(dashboard.activeByStatus),
    chart: toOrdersChart(dashboard),
    stages: toStageRows(dashboard.averageStageMinutes),
    topProducts: toTopProducts(dashboard.topProducts),
    cancellations: toCancellationsView(dashboard.cancellations),
  };
}
