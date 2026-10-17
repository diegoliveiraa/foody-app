import { CircleX, Clock, type LucideIcon } from "lucide-react";
import type { JSX } from "react";
import type { CustomerOrder } from "@/@types/orders";
import { Button } from "@/components/ui/button";
import { CANCELLATION_STATES, SHEET_MODES } from "../constants";
import { SHEET_COPY, TRACKING_MESSAGES } from "../constants/messages";
import type { CancellationModel, CancellationState, SheetMode } from "../types";

interface CancellationBlockProps {
  order: CustomerOrder;
  model: CancellationModel;
}

interface OfferProps {
  mode: SheetMode;
  model: CancellationModel;
}

interface AnswerProps {
  icon: LucideIcon;
  message: string;
  note?: string | null;
}

const SECTION_CLASS: string =
  "flex flex-col gap-3 rounded-2xl border border-attention-soft-border bg-attention p-4 text-sm leading-relaxed text-attention-foreground";

function Offer({ mode, model }: OfferProps): JSX.Element {
  return (
    <section aria-label={TRACKING_MESSAGES.CANCELLATION} className={SECTION_CLASS}>
      <p>{SHEET_COPY[mode].intro}</p>
      <Button
        type="button"
        variant="outline"
        onClick={(): void => model.show(mode)}
        className="h-12 rounded-[14px] border-[1.5px] border-primary text-[15px] text-primary hover:text-primary-hover"
      >
        {SHEET_COPY[mode].open}
      </Button>
    </section>
  );
}

function Answer({ icon: Icon, message, note }: AnswerProps): JSX.Element {
  return (
    <section aria-label={TRACKING_MESSAGES.CANCELLATION} className={SECTION_CLASS}>
      <p className="flex items-start gap-2 font-semibold">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {message}
      </p>
      {note && <p className="break-words">{note}</p>}
    </section>
  );
}

const VIEWS: Record<CancellationState, (props: CancellationBlockProps) => JSX.Element> = {
  [CANCELLATION_STATES.CANCEL]: ({ model }: CancellationBlockProps): JSX.Element => (
    <Offer mode={SHEET_MODES.CANCEL} model={model} />
  ),
  [CANCELLATION_STATES.REQUEST]: ({ model }: CancellationBlockProps): JSX.Element => (
    <Offer mode={SHEET_MODES.REQUEST} model={model} />
  ),
  [CANCELLATION_STATES.PENDING]: (): JSX.Element => (
    <Answer icon={Clock} message={TRACKING_MESSAGES.REQUEST_PENDING} />
  ),
  [CANCELLATION_STATES.DECLINED]: ({ order }: CancellationBlockProps): JSX.Element => (
    <Answer
      icon={CircleX}
      message={TRACKING_MESSAGES.REQUEST_DECLINED}
      note={order.cancellationRequest?.decisionNote}
    />
  ),
};

export function CancellationBlock({ order, model }: CancellationBlockProps): JSX.Element | null {
  if (model.state === null) {
    return null;
  }
  return VIEWS[model.state]({ order, model });
}
