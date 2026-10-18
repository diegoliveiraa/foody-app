import { useMemo } from "react";
import type { Dashboard, DashboardPeriod } from "@/@types/dashboard";
import { useReload } from "@/hooks/use-reload";
import { DASHBOARD_POLLING, useGetDashboardQuery } from "@/services/dashboard";
import { extractApiError } from "@/utils/api-error";
import { DASHBOARD_TAGS } from "../constants";
import type { DashboardModel, DashboardView } from "../types";
import { toDashboardView } from "../utils/dashboard-view";

export function useDashboard(period: DashboardPeriod): DashboardModel {
  const { data, currentData, error, isFetching } = useGetDashboardQuery(period, DASHBOARD_POLLING);
  const reload: () => void = useReload(DASHBOARD_TAGS);
  const shown: Dashboard | undefined = currentData ?? (isFetching ? data : undefined);
  const view: DashboardView | null = useMemo(
    (): DashboardView | null => (shown === undefined ? null : toDashboardView(shown)),
    [shown],
  );
  const loadError: string | null = useMemo(
    (): string | null =>
      shown !== undefined || isFetching || error === undefined
        ? null
        : extractApiError(error).detail,
    [shown, isFetching, error],
  );

  return {
    view,
    loading: view === null && loadError === null,
    loadError,
    switching: view !== null && currentData === undefined,
    refreshing: isFetching,
    reload,
  };
}
