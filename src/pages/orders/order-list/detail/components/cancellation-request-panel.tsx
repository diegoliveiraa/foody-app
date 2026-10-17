import { TriangleAlert } from "lucide-react";
import { useId, type JSX } from "react";
import type { StaffCancellationRequest, StaffOrder } from "@/@types/orders";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import {
  CANCELLATION_REASON_LABELS,
  CANCELLATION_REQUEST_STATUSES,
  type DecidedRequestStatus,
} from "@/constants/orders";
import { formatClock } from "@/utils/format-order-date";
import { DECISIONS } from "../constants";
import {
  DECISION_COPY,
  ORDER_DETAIL_MESSAGES,
  REQUEST_DECIDED_LABELS,
} from "../constants/messages";
import type { DecisionModel } from "../types";

interface CancellationRequestPanelProps {
  order: StaffOrder;
  decision: DecisionModel;
}

interface PendingRequestProps {
  request: StaffCancellationRequest;
  customerName: string;
  decision: DecisionModel;
}

interface DecidedRequestProps {
  status: DecidedRequestStatus;
  request: StaffCancellationRequest;
}

function isText(part: string | null | undefined): part is string {
  return Boolean(part);
}

function PendingRequest({ request, customerName, decision }: PendingRequestProps): JSX.Element {
  const titleId: string = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border-2 border-attention-border bg-attention p-4"
    >
      <div className="flex items-center gap-2 text-attention-foreground">
        <TriangleAlert aria-hidden="true" className="size-[18px] shrink-0" />
        <h2 id={titleId} className="font-sans text-base font-bold">
          {ORDER_DETAIL_MESSAGES.CUSTOMER_REQUESTED}
        </h2>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">
          {MESSAGES.ORDERS.REASON(CANCELLATION_REASON_LABELS[request.reason])}
        </span>
        {request.note && <span className="break-words">{request.note}</span>}
        <span className="text-muted-foreground">
          {ORDER_DETAIL_MESSAGES.REQUESTED_BY(formatClock(request.requestedAt), customerName)}
        </span>
      </div>
      {decision.canDecide && (
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={decision.sending}
            onClick={(): void => decision.ask(DECISIONS.DECLINE)}
            className="h-12 rounded-xl text-[15px]"
          >
            {DECISION_COPY[DECISIONS.DECLINE].action}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="lg"
            disabled={decision.sending}
            onClick={(): void => decision.ask(DECISIONS.APPROVE)}
            className="h-12 rounded-xl text-[15px]"
          >
            {DECISION_COPY[DECISIONS.APPROVE].action}
          </Button>
        </div>
      )}
    </section>
  );
}

function DecidedRequest({ status, request }: DecidedRequestProps): JSX.Element {
  const line: string = [
    REQUEST_DECIDED_LABELS[status],
    request.decidedAt ? formatClock(request.decidedAt) : null,
    request.decidedByName,
  ]
    .filter(isText)
    .join(ORDER_DETAIL_MESSAGES.LINE_SEPARATOR);

  return (
    <section
      aria-label={ORDER_DETAIL_MESSAGES.REQUEST}
      className="flex flex-col gap-1 rounded-2xl border bg-card p-4 text-sm"
    >
      <span className="font-semibold">{line}</span>
      {request.decisionNote && (
        <span className="break-words text-muted-foreground">{request.decisionNote}</span>
      )}
    </section>
  );
}

export function CancellationRequestPanel({
  order,
  decision,
}: CancellationRequestPanelProps): JSX.Element | null {
  const request: StaffCancellationRequest | null | undefined = order.cancellationRequest;
  if (request === null || request === undefined) {
    return null;
  }
  if (request.status === CANCELLATION_REQUEST_STATUSES.PENDING) {
    return (
      <PendingRequest request={request} customerName={order.customer.name} decision={decision} />
    );
  }
  return <DecidedRequest status={request.status} request={request} />;
}
