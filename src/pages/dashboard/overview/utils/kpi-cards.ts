import type { Dashboard } from "@/@types/dashboard";
import { formatMoney } from "@/utils/format-money";
import { formatCount, formatPercent, formatPercentChange } from "@/utils/format-number";
import { DETAIL_TONES } from "../constants";
import { COMPARISON_LABELS, DASHBOARD_MESSAGES } from "../constants/messages";
import type { DetailTone, KpiCard } from "../types";
import { isKnown, orDash } from "./or-dash";

type CardDetail = Pick<KpiCard, "detail" | "tone">;

const TONES_BY_SIGN: Record<number, DetailTone> = {
  [1]: DETAIL_TONES.UP,
  [-1]: DETAIL_TONES.DOWN,
  [0]: DETAIL_TONES.NEUTRAL,
};

function ordersChange({ orders, period }: Dashboard): CardDetail {
  const change: number | null | undefined = orders.changePercent;
  if (!isKnown(change)) {
    return { detail: DASHBOARD_MESSAGES.NO_PREVIOUS_ORDERS, tone: DETAIL_TONES.MUTED };
  }
  return {
    detail: DASHBOARD_MESSAGES.CHANGE(formatPercentChange(change), COMPARISON_LABELS[period]),
    tone: TONES_BY_SIGN[Math.sign(change)],
  };
}

export function toKpiCards(dashboard: Dashboard): KpiCard[] {
  return [
    {
      label: DASHBOARD_MESSAGES.ORDERS,
      value: formatCount(dashboard.orders.count),
      ...ordersChange(dashboard),
    },
    {
      label: DASHBOARD_MESSAGES.REVENUE,
      value: formatMoney(dashboard.revenue),
      detail: DASHBOARD_MESSAGES.REVENUE_DETAIL,
      tone: DETAIL_TONES.MUTED,
    },
    {
      label: DASHBOARD_MESSAGES.AVERAGE_TICKET,
      value: orDash(dashboard.averageTicket, formatMoney),
      detail: DASHBOARD_MESSAGES.AVERAGE_TICKET_DETAIL,
      tone: DETAIL_TONES.MUTED,
    },
    {
      label: DASHBOARD_MESSAGES.CANCELLATIONS,
      value: orDash(dashboard.cancellations.ratePercent, formatPercent),
      detail: DASHBOARD_MESSAGES.CANCELLED_OF(
        dashboard.cancellations.count,
        dashboard.orders.count,
      ),
      tone: DETAIL_TONES.MUTED,
    },
  ];
}
