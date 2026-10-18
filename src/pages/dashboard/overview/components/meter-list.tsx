import { cn } from "cn";
import type { JSX } from "react";
import type { MeterRow } from "../types";

interface MeterListProps {
  rows: readonly MeterRow[];
  barClassName: string;
}

export function MeterList({ rows, barClassName }: MeterListProps): JSX.Element {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row: MeterRow): JSX.Element => (
        <li key={row.key} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-3 text-[13px]">
            <span className="min-w-0">{row.label}</span>
            <span className="font-bold whitespace-nowrap">{row.value}</span>
          </div>
          <div aria-hidden="true" className="h-2.5 rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", barClassName)}
              style={{ width: `${row.widthPercent}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
