import type { DashboardPeriod } from "@/@types/dashboard";
import { DASHBOARD_PERIOD_LIST, DEFAULT_PERIOD } from "../constants";

function isPeriod(value: string | null): value is DashboardPeriod {
  return DASHBOARD_PERIOD_LIST.some((period: DashboardPeriod): boolean => period === value);
}

export function parsePeriod(value: string | null): DashboardPeriod {
  return isPeriod(value) ? value : DEFAULT_PERIOD;
}
