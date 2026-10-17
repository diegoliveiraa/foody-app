import { CircleX } from "lucide-react";
import type { JSX } from "react";
import type { OrderCancellation as Cancellation } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { CANCELLATION_REASON_LABELS, CANCELLED_BY_LABELS } from "@/constants/orders";

interface OrderCancellationProps {
  cancellation: Cancellation;
}

export function OrderCancellation({ cancellation }: OrderCancellationProps): JSX.Element {
  return (
    <section
      aria-label={MESSAGES.ORDERS.CANCELLED_TITLE}
      className="flex flex-col gap-2 rounded-2xl border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <CircleX aria-hidden="true" className="size-5 text-status-cancelled-accent" />
        <h2 className="font-sans text-base font-bold">{MESSAGES.ORDERS.CANCELLED_TITLE}</h2>
      </div>
      <p className="text-[15px] font-semibold">{CANCELLED_BY_LABELS[cancellation.cancelledBy]}</p>
      <p className="text-sm">
        {MESSAGES.ORDERS.REASON(CANCELLATION_REASON_LABELS[cancellation.reason])}
      </p>
      {cancellation.note && (
        <p className="text-sm break-words text-muted-foreground">{cancellation.note}</p>
      )}
    </section>
  );
}
