import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import type { JSX, ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import type { PeriodModel } from "../types";
import { useDashboardPeriod } from "./use-dashboard-period";

interface PeriodInAddress {
  model: PeriodModel;
  search: string;
}

function usePeriodInAddress(): PeriodInAddress {
  return { model: useDashboardPeriod(), search: useLocation().search };
}

function renderAt(entry: string): RenderHookResult<PeriodInAddress, unknown> {
  return renderHook(usePeriodInAddress, {
    wrapper: ({ children }: { children: ReactNode }): JSX.Element => (
      <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
    ),
  });
}

describe("useDashboardPeriod", () => {
  it("reads the period from the address", () => {
    const { result }: RenderHookResult<PeriodInAddress, unknown> = renderAt(
      "/dashboard?period=LAST_7_DAYS",
    );

    expect(result.current.model.period).toBe("LAST_7_DAYS");
  });

  it("starts on today when the address names an unknown period", () => {
    const { result }: RenderHookResult<PeriodInAddress, unknown> = renderAt(
      "/dashboard?period=semana",
    );

    expect(result.current.model.period).toBe("TODAY");
  });

  it("writes the chosen period into the address, keeping its other parameters", () => {
    const { result }: RenderHookResult<PeriodInAddress, unknown> = renderAt("/dashboard?from=menu");

    act((): void => result.current.model.choose("LAST_30_DAYS"));

    const params: URLSearchParams = new URLSearchParams(result.current.search);
    expect(result.current.model.period).toBe("LAST_30_DAYS");
    expect(params.get("period")).toBe("LAST_30_DAYS");
    expect(params.get("from")).toBe("menu");
  });
});
