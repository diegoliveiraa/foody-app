import type { JSX } from "react";
import { PageHeader } from "@/components/page-header";
import { PendingRequestsBanner } from "@/components/pending-requests-banner";
import { ReloadButton } from "@/components/reload-button";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useOrderListPaths } from "@/hooks/use-order-list-paths";
import type { OrderListPaths } from "@/routes/types";
import { ActiveNow } from "./components/active-now";
import { CancellationsCard } from "./components/cancellations-card";
import { DashboardLoadError, DashboardSkeleton } from "./components/dashboard-states";
import { KpiGrid } from "./components/kpi-grid";
import { OrdersChartSection } from "./components/orders-chart";
import { PeriodPicker } from "./components/period-picker";
import { StageTimes } from "./components/stage-times";
import { TopProducts } from "./components/top-products";
import { DASHBOARD_MESSAGES } from "./constants/messages";
import { useDashboard } from "./hooks/use-dashboard";
import { useDashboardPeriod } from "./hooks/use-dashboard-period";
import type { DashboardModel, DashboardView, PeriodModel } from "./types";

interface DashboardContentProps {
  view: DashboardView;
  switching: boolean;
}

function DashboardContent({ view, switching }: DashboardContentProps): JSX.Element {
  const paths: OrderListPaths = useOrderListPaths();
  const canDecide: boolean = useCan(
    SCREEN_KEYS.ORDERS_ORDER_LIST,
    SCREEN_ACTIONS.DECIDE_CANCELLATION,
  );

  return (
    <div
      aria-busy={switching}
      className="flex flex-col gap-3 transition-opacity aria-busy:opacity-60"
    >
      <KpiGrid kpis={view.kpis} />
      {canDecide && view.pending !== null && (
        <PendingRequestsBanner label={view.pending.label} to={paths.detail(view.pending.orderId)} />
      )}
      <div className="grid items-start gap-3 lg:grid-cols-2">
        <ActiveNow active={view.active} boardPath={paths.board} />
        <OrdersChartSection chart={view.chart} />
        <StageTimes stages={view.stages} />
        <TopProducts products={view.topProducts} />
        <CancellationsCard cancellations={view.cancellations} />
      </div>
    </div>
  );
}

function DashboardBody({ dashboard }: { dashboard: DashboardModel }): JSX.Element {
  if (dashboard.loadError !== null) {
    return <DashboardLoadError detail={dashboard.loadError} onRetry={dashboard.reload} />;
  }
  if (dashboard.view === null) {
    return <DashboardSkeleton />;
  }
  return <DashboardContent view={dashboard.view} switching={dashboard.switching} />;
}

export function OverviewScreen(): JSX.Element {
  const { period, choose }: PeriodModel = useDashboardPeriod();
  const dashboard: DashboardModel = useDashboard(period);

  return (
    <>
      <PageHeader title={DASHBOARD_MESSAGES.TITLE} description={dashboard.view?.updatedAt}>
        <ReloadButton
          label={DASHBOARD_MESSAGES.RELOAD_LABEL}
          refreshing={dashboard.refreshing}
          onReload={dashboard.reload}
        />
      </PageHeader>
      <section className="flex flex-1 flex-col gap-3 px-4 pb-8 md:px-8">
        <PeriodPicker period={period} onChange={choose} />
        <DashboardBody dashboard={dashboard} />
      </section>
    </>
  );
}
