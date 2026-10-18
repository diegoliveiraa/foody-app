import type { components, operations } from "./api";

export type Dashboard = components["schemas"]["DashboardResponse"];

export type DashboardParams = NonNullable<operations["dashboardOverview"]["parameters"]["query"]>;

export type DashboardPeriod = Dashboard["period"];

export type DashboardOrders = components["schemas"]["DashboardOrders"];

export type DashboardOrdersOverTime = components["schemas"]["DashboardOrdersOverTime"];

export type DashboardGranularity = DashboardOrdersOverTime["granularity"];

export type DashboardBucket = components["schemas"]["DashboardBucket"];

export type DashboardTopProduct = components["schemas"]["DashboardTopProduct"];

export type DashboardActiveOrders = components["schemas"]["DashboardActiveOrders"];

export type DashboardStageMinutes = components["schemas"]["DashboardStageMinutes"];

export type DashboardCancellations = components["schemas"]["DashboardCancellations"];

export type DashboardCancellationCount = components["schemas"]["DashboardCancellationCount"];

export type DashboardPendingRequests = components["schemas"]["DashboardPendingRequests"];

export type DashboardPendingRequest = components["schemas"]["DashboardPendingRequest"];
