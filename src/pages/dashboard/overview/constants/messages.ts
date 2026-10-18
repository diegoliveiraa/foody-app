import type { DashboardGranularity, DashboardPeriod } from "@/@types/dashboard";
import { DASHBOARD_POLLING_SECONDS } from "@/constants/orders";
import { formatCount } from "@/utils/format-number";
import type { StageKey } from "../types";
import { DASHBOARD_GRANULARITIES, DASHBOARD_PERIODS } from ".";

const ONE: number = 1;

const ORDERS: string = "Pedidos";

const CANCELLATIONS: string = "Cancelamentos";

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  [DASHBOARD_PERIODS.TODAY]: "Hoje",
  [DASHBOARD_PERIODS.LAST_7_DAYS]: "7 dias",
  [DASHBOARD_PERIODS.LAST_30_DAYS]: "30 dias",
};

export const COMPARISON_LABELS: Record<DashboardPeriod, string> = {
  [DASHBOARD_PERIODS.TODAY]: "vs ontem",
  [DASHBOARD_PERIODS.LAST_7_DAYS]: "vs 7 dias anteriores",
  [DASHBOARD_PERIODS.LAST_30_DAYS]: "vs 30 dias anteriores",
};

export const CHART_TITLES: Record<DashboardGranularity, string> = {
  [DASHBOARD_GRANULARITIES.HOUR]: "Pedidos por hora",
  [DASHBOARD_GRANULARITIES.DAY]: "Pedidos por dia",
};

export const BUCKET_HEADERS: Record<DashboardGranularity, string> = {
  [DASHBOARD_GRANULARITIES.HOUR]: "Hora",
  [DASHBOARD_GRANULARITIES.DAY]: "Dia",
};

export const STAGE_LABELS: Record<StageKey, string> = {
  receivedToPreparing: "Recebido → Em preparo",
  preparingToOutForDelivery: "Em preparo → Saiu",
  outForDeliveryToDelivered: "Saiu → Entregue",
};

export const DASHBOARD_MESSAGES = {
  TITLE: "Dashboard",
  UPDATED_AT: (clock: string): string =>
    `Atualizado às ${clock} · a cada ${DASHBOARD_POLLING_SECONDS} s`,
  RELOAD_LABEL: "Recarregar indicadores",
  PERIOD: "Período",
  LOADING: "Carregando indicadores",
  LOAD_FAILED: "Não foi possível carregar os indicadores",
  INDICATORS: "Indicadores do período",
  ORDERS,
  REVENUE: "Faturamento",
  REVENUE_DETAIL: "pedidos entregues",
  AVERAGE_TICKET: "Ticket médio",
  AVERAGE_TICKET_DETAIL: "por pedido entregue",
  CANCELLATIONS,
  CHANGE: (change: string, comparison: string): string => `${change} ${comparison}`,
  NO_PREVIOUS_ORDERS: "Sem pedidos no período anterior",
  CANCELLED_OF: (cancelled: number, total: number): string =>
    `${formatCount(cancelled)} de ${formatCount(total)} ${total === ONE ? "pedido" : "pedidos"}`,
  NOT_AVAILABLE: "—",
  PENDING_REQUESTS: (count: number): string =>
    count === ONE
      ? `${formatCount(count)} solicitação de cancelamento pendente`
      : `${formatCount(count)} solicitações de cancelamento pendentes`,
  NOW: "Agora",
  ACTIVE_COUNT: (count: string, label: string): string => `${count} ${label}`,
  CHART_LABEL: (title: string, period: string): string => `${title}, período ${period}`,
  CHART_COUNT: ORDERS,
  WEEKDAY_DATE: (weekday: string, date: string): string => `${weekday}, ${date}`,
  STAGE_TIMES: "Tempo médio por etapa",
  TOP_PRODUCTS: "Mais vendidos",
  UNITS: (quantity: number): string => `${formatCount(quantity)} un`,
  NO_DELIVERED_ORDERS: "Nenhum pedido entregue no período",
  CANCELLATION_RATE: (rate: string): string => `${rate} no período`,
  CANCELLATION_REASON: (reason: string, side: string): string => `${reason} · ${side}`,
  NO_CANCELLATIONS: "Nenhum cancelamento no período",
} as const;
