import { cn } from "cn";
import { useId, type JSX } from "react";
import { DETAIL_TONES } from "../constants";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { DetailTone, KpiCard } from "../types";

const DETAIL_TONE_CLASSES: Record<DetailTone, string> = {
  [DETAIL_TONES.UP]: "font-semibold text-status-delivered-accent",
  [DETAIL_TONES.DOWN]: "font-semibold text-destructive",
  [DETAIL_TONES.NEUTRAL]: "font-semibold text-muted-foreground",
  [DETAIL_TONES.MUTED]: "text-muted-foreground",
};

function KpiCardView({ kpi }: { kpi: KpiCard }): JSX.Element {
  const labelId: string = useId();

  return (
    <article
      aria-labelledby={labelId}
      className="flex min-w-0 flex-col gap-1.5 rounded-2xl border bg-card p-3.5"
    >
      <h3 id={labelId} className="font-sans text-[13px] font-normal text-muted-foreground">
        {kpi.label}
      </h3>
      <p className="font-heading text-xl leading-tight font-bold tracking-tight [overflow-wrap:anywhere] min-[400px]:text-[23px]">
        {kpi.value}
      </p>
      <p className={cn("text-xs", DETAIL_TONE_CLASSES[kpi.tone])}>{kpi.detail}</p>
    </article>
  );
}

export function KpiGrid({ kpis }: { kpis: readonly KpiCard[] }): JSX.Element {
  const headingId: string = useId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        {DASHBOARD_MESSAGES.INDICATORS}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {kpis.map((kpi: KpiCard): JSX.Element => (
          <KpiCardView key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}
