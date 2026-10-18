import type { JSX } from "react";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { CancellationsView } from "../types";
import { DashboardSection } from "./dashboard-section";
import { EmptySectionNote } from "./empty-section-note";
import { MeterList } from "./meter-list";

export function CancellationsCard({
  cancellations,
}: {
  cancellations: CancellationsView;
}): JSX.Element {
  return (
    <DashboardSection
      title={DASHBOARD_MESSAGES.CANCELLATIONS}
      aside={
        cancellations.rate !== null && (
          <span className="text-[13px] text-muted-foreground">{cancellations.rate}</span>
        )
      }
    >
      {cancellations.rows.length === 0 ? (
        <EmptySectionNote>{DASHBOARD_MESSAGES.NO_CANCELLATIONS}</EmptySectionNote>
      ) : (
        <MeterList rows={cancellations.rows} barClassName="bg-muted-foreground" />
      )}
    </DashboardSection>
  );
}
