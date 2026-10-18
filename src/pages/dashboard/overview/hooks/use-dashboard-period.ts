import { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { DashboardPeriod } from "@/@types/dashboard";
import { PERIOD_PARAM } from "../constants";
import type { PeriodModel } from "../types";
import { parsePeriod } from "../utils/period-param";

export function useDashboardPeriod(): PeriodModel {
  const [searchParams, setSearchParams] = useSearchParams();
  const period: DashboardPeriod = parsePeriod(searchParams.get(PERIOD_PARAM));
  const choose = useCallback(
    (next: DashboardPeriod): void => {
      setSearchParams(
        (current: URLSearchParams): URLSearchParams => {
          const params: URLSearchParams = new URLSearchParams(current);
          params.set(PERIOD_PARAM, next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { period, choose };
}
