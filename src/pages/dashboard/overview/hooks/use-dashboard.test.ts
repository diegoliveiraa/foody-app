import { renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { DashboardPeriod } from "@/@types/dashboard";
import { tokenReceived } from "@/store/slices/session";
import { dashboardResponse, weekDashboard } from "@/test/dashboard";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { DashboardModel } from "../types";
import { useDashboard } from "./use-dashboard";

vi.mock("sonner", () => ({ toast: vi.fn() }));

interface HookProps {
  period: DashboardPeriod;
}

type DashboardHook = RenderHookResult<DashboardModel, HookProps>;

interface Gate {
  opened: Promise<void>;
  open: () => void;
}

function gate(): Gate {
  let open: () => void = (): void => {};
  const opened: Promise<void> = new Promise<void>((resolve: () => void): void => {
    open = resolve;
  });
  return { opened, open };
}

function renderDashboard(period: DashboardPeriod): DashboardHook {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(({ period: current }: HookProps): DashboardModel => useDashboard(current), {
    initialProps: { period },
    wrapper: withStore(store),
  });
}

function answerByPeriod(weekAnswered: Promise<void> = Promise.resolve()): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(apiUrl("/dashboard"), async ({ request }) => {
      const url: URL = new URL(request.url);
      urls.push(url);
      if (url.searchParams.get("period") === "LAST_7_DAYS") {
        await weekAnswered;
        return HttpResponse.json(weekDashboard());
      }
      return HttpResponse.json(dashboardResponse());
    }),
  );
  return urls;
}

function ordersShown(result: DashboardHook["result"]): string | undefined {
  return result.current.view?.kpis[0]?.value;
}

describe("useDashboard", () => {
  it("shows the overview of the chosen period once it arrives", async () => {
    const urls: URL[] = answerByPeriod();

    const { result }: DashboardHook = renderDashboard("TODAY");

    expect(result.current.loading).toBe(true);
    await waitFor((): void => expect(ordersShown(result)).toBe("48"));
    expect(result.current.loading).toBe(false);
    expect(result.current.switching).toBe(false);
    expect(urls.map((url: URL): string | null => url.searchParams.get("period"))).toEqual([
      "TODAY",
    ]);
  });

  it("keeps the previous period on screen, marked as switching, while the next one loads", async () => {
    const week: Gate = gate();
    answerByPeriod(week.opened);
    const { result, rerender }: DashboardHook = renderDashboard("TODAY");
    await waitFor((): void => expect(ordersShown(result)).toBe("48"));

    rerender({ period: "LAST_7_DAYS" });

    await waitFor((): void => expect(result.current.switching).toBe(true));
    expect(ordersShown(result)).toBe("48");
    expect(result.current.loading).toBe(false);
    week.open();
    await waitFor((): void => expect(ordersShown(result)).toBe("312"));
    expect(result.current.switching).toBe(false);
  });

  it("tells why the overview could not be loaded", async () => {
    server.use(
      http.get(apiUrl("/dashboard"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );

    const { result }: DashboardHook = renderDashboard("TODAY");

    await waitFor((): void => expect(result.current.loadError).toBe("Erro inesperado"));
    expect(result.current.view).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("asks for the overview again when reloaded", async () => {
    const urls: URL[] = answerByPeriod();
    const { result }: DashboardHook = renderDashboard("TODAY");
    await waitFor((): void => expect(urls).toHaveLength(1));

    result.current.reload();

    await waitFor((): void => expect(urls).toHaveLength(2));
  });
});
