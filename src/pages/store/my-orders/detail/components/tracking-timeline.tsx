import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type { JSX } from "react";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import type { StatusTone } from "@/components/order-status-badge/types";
import { ORDER_STATUS_LABELS } from "@/constants/orders";
import { formatClock } from "@/utils/format-order-date";
import { DONE_ICON, STEP_ICONS, STEP_STATES } from "../constants";
import { STEP_HINTS, TRACKING_MESSAGES } from "../constants/messages";
import type { StepState, TrackingStep } from "../types";

interface TrackingTimelineProps {
  steps: readonly TrackingStep[];
}

interface StepItemProps {
  step: TrackingStep;
}

const CIRCLE_CLASSES: Record<StepState, (tone: StatusTone) => string> = {
  [STEP_STATES.DONE]: (tone: StatusTone): string => cn(tone.dot, "text-white"),
  [STEP_STATES.CURRENT]: (tone: StatusTone): string => cn(tone.dot, "text-white ring-6", tone.ring),
  [STEP_STATES.PENDING]: (): string =>
    "border-2 border-dashed border-input bg-muted text-muted-foreground",
};

const LABEL_CLASSES: Record<StepState, (tone: StatusTone) => string> = {
  [STEP_STATES.DONE]: (): string => "font-semibold",
  [STEP_STATES.CURRENT]: (tone: StatusTone): string => cn("font-bold", tone.text),
  [STEP_STATES.PENDING]: (): string => "font-semibold text-muted-foreground",
};

function stepDetail({ status, state, reachedAt }: TrackingStep): string | null {
  if (state === STEP_STATES.PENDING) {
    return null;
  }
  const parts: string[] = [
    reachedAt === null ? null : formatClock(reachedAt),
    STEP_HINTS[status],
  ].filter((part: string | null | undefined): part is string => Boolean(part));
  return parts.length === 0 ? null : parts.join(TRACKING_MESSAGES.STEP_SEPARATOR);
}

function StepItem({ step }: StepItemProps): JSX.Element {
  const tone: StatusTone = ORDER_STATUS_TONES[step.status];
  const Icon: LucideIcon = step.state === STEP_STATES.DONE ? DONE_ICON : STEP_ICONS[step.status];
  const detail: string | null = stepDetail(step);
  const lineClass: string = step.state === STEP_STATES.DONE ? tone.dot : "bg-border";

  return (
    <li
      aria-current={step.state === STEP_STATES.CURRENT ? "step" : undefined}
      className="group/step flex gap-3.5"
    >
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            CIRCLE_CLASSES[step.state](tone),
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className={cn("min-h-6.5 w-0.5 flex-1 group-last/step:hidden", lineClass)} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 pb-4.5">
        <span className={cn("text-[15px]", LABEL_CLASSES[step.state](tone))}>
          {ORDER_STATUS_LABELS[step.status]}
        </span>
        {detail !== null && (
          <span className="text-[13px] break-words text-muted-foreground">{detail}</span>
        )}
      </div>
    </li>
  );
}

export function TrackingTimeline({ steps }: TrackingTimelineProps): JSX.Element {
  return (
    <ol aria-label={TRACKING_MESSAGES.TIMELINE} className="flex flex-col">
      {steps.map((step: TrackingStep): JSX.Element => (
        <StepItem key={step.status} step={step} />
      ))}
    </ol>
  );
}
