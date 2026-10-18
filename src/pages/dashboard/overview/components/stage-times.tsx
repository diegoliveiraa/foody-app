import type { JSX } from "react";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { MeterRow } from "../types";
import { DashboardSection } from "./dashboard-section";
import { MeterList } from "./meter-list";

export function StageTimes({ stages }: { stages: readonly MeterRow[] }): JSX.Element {
  return (
    <DashboardSection title={DASHBOARD_MESSAGES.STAGE_TIMES}>
      <MeterList rows={stages} barClassName="bg-status-preparing-accent" />
    </DashboardSection>
  );
}
