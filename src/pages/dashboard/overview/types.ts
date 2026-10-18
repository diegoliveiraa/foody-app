import type { DashboardPeriod, DashboardStageMinutes } from "@/@types/dashboard";
import type { OrderId } from "@/@types/orders";
import type { BoardStatus } from "@/constants/orders";
import type { DETAIL_TONES } from "./constants";

export type DetailTone = (typeof DETAIL_TONES)[keyof typeof DETAIL_TONES];

export type StageKey = keyof DashboardStageMinutes;

export interface KpiCard {
  label: string;
  value: string;
  detail: string;
  tone: DetailTone;
}

export interface PendingBanner {
  label: string;
  orderId: OrderId;
}

export interface ActiveCount {
  status: BoardStatus;
  label: string;
  count: string;
}

export interface ChartPoint {
  key: string;
  label: string;
  fullLabel: string;
  count: number;
}

export interface OrdersChart {
  title: string;
  label: string;
  bucketHeader: string;
  points: ChartPoint[];
  ticks: string[];
}

export interface MeterRow {
  key: string;
  label: string;
  value: string;
  widthPercent: number;
}

export interface TopProductRow {
  productId: string;
  rank: number;
  name: string;
  units: string;
  revenue: string;
}

export interface CancellationsView {
  rate: string | null;
  rows: MeterRow[];
}

export interface DashboardView {
  updatedAt: string;
  kpis: KpiCard[];
  pending: PendingBanner | null;
  active: ActiveCount[];
  chart: OrdersChart;
  stages: MeterRow[];
  topProducts: TopProductRow[];
  cancellations: CancellationsView;
}

export interface DashboardModel {
  view: DashboardView | null;
  loading: boolean;
  loadError: string | null;
  switching: boolean;
  refreshing: boolean;
  reload: () => void;
}

export interface PeriodModel {
  period: DashboardPeriod;
  choose: (period: DashboardPeriod) => void;
}
