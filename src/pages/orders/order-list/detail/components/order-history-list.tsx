import { cn } from "cn";
import { useMemo, type JSX } from "react";
import type { StaffOrder } from "@/@types/orders";
import { ORDER_DETAIL_MESSAGES } from "../constants/messages";
import type { HistoryEntryView } from "../types";
import { toHistoryEntries } from "../utils/history-entries";

interface OrderHistoryListProps {
  order: StaffOrder;
}

export function OrderHistoryList({ order }: OrderHistoryListProps): JSX.Element {
  const entries: readonly HistoryEntryView[] = useMemo(
    (): HistoryEntryView[] => toHistoryEntries(order),
    [order],
  );

  return (
    <section
      aria-label={ORDER_DETAIL_MESSAGES.HISTORY}
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
    >
      <h2 className="font-sans text-base font-bold">{ORDER_DETAIL_MESSAGES.HISTORY}</h2>
      <ol className="flex flex-col gap-3">
        {entries.map((entry: HistoryEntryView): JSX.Element => (
          <li key={entry.key} className="flex gap-3 text-sm">
            <span
              aria-hidden="true"
              className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", entry.dot)}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold">{entry.title}</span>
              <span className="text-muted-foreground">{entry.detail}</span>
              {entry.reason !== null && <span>{entry.reason}</span>}
              {entry.note !== null && (
                <span className="break-words text-muted-foreground">{entry.note}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
