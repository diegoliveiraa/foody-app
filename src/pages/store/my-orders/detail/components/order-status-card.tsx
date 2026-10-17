import { cn } from "cn";
import { Clock } from "lucide-react";
import { useMemo, type JSX } from "react";
import type { CustomerOrder } from "@/@types/orders";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/constants/orders";
import { TRACKING_MESSAGES } from "../constants/messages";
import type { TrackingStep } from "../types";
import { toTrackingSteps } from "../utils/tracking-steps";
import { TrackingTimeline } from "./tracking-timeline";

interface OrderStatusCardProps {
  order: CustomerOrder;
}

function LiveBadge(): JSX.Element {
  return (
    <span className="inline-flex h-7.5 shrink-0 items-center gap-1.5 rounded-full bg-status-preparing px-3 text-[13px] font-semibold text-status-preparing-foreground">
      <Clock aria-hidden="true" className="size-3.5" />
      {TRACKING_MESSAGES.LIVE}
    </span>
  );
}

export function OrderStatusCard({ order }: OrderStatusCardProps): JSX.Element {
  const steps: readonly TrackingStep[] = useMemo(
    (): TrackingStep[] => toTrackingSteps(order),
    [order],
  );
  const cancelled: boolean = order.status === ORDER_STATUSES.CANCELLED;

  return (
    <section
      aria-label={TRACKING_MESSAGES.STATUS}
      className="flex flex-col gap-4.5 rounded-2xl border bg-card p-4.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">{TRACKING_MESSAGES.STATUS_NOW}</span>
          <span
            className={cn("font-heading text-2xl font-bold", ORDER_STATUS_TONES[order.status].text)}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        {order.live && <LiveBadge />}
      </div>
      {!cancelled && <TrackingTimeline steps={steps} />}
    </section>
  );
}
