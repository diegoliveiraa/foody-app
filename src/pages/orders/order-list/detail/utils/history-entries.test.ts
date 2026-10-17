import { describe, expect, it } from "vitest";
import type { StaffCancellationRequest, StaffOrderHistoryEntry } from "@/@types/orders";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import { formatClock } from "@/utils/format-order-date";
import { REQUEST_DOT } from "../constants";
import type { HistoryEntryView } from "../types";
import { toHistoryEntries } from "./history-entries";

const CUSTOMER_NAME: string = "Ana P.";

const CREATED: StaffOrderHistoryEntry = {
  fromStatus: null,
  toStatus: "RECEIVED",
  actorSide: "CUSTOMER",
  actorName: CUSTOMER_NAME,
  occurredAt: "2026-10-17T22:02:00Z",
};

const STARTED: StaffOrderHistoryEntry = {
  fromStatus: "RECEIVED",
  toStatus: "PREPARING",
  actorSide: "RESTAURANT",
  actorName: "Carlos M.",
  occurredAt: "2026-10-17T22:05:00Z",
};

const CANCELLED: StaffOrderHistoryEntry = {
  fromStatus: "PREPARING",
  toStatus: "CANCELLED",
  actorSide: "RESTAURANT",
  actorName: "Carlos M.",
  occurredAt: "2026-10-17T22:31:00Z",
  reason: "ITEM_UNAVAILABLE",
  note: "Acabou o pão",
};

const PENDING_REQUEST: StaffCancellationRequest = {
  status: "PENDING",
  reason: "TAKING_TOO_LONG",
  note: "Já faz meia hora",
  requestedAt: "2026-10-17T22:31:00Z",
};

const DECLINED_REQUEST: StaffCancellationRequest = {
  ...PENDING_REQUEST,
  status: "DECLINED",
  decidedAt: "2026-10-17T22:34:00Z",
  decidedByName: "Carlos M.",
  decisionNote: "Já está saindo",
};

const APPROVED_REQUEST: StaffCancellationRequest = {
  ...PENDING_REQUEST,
  status: "APPROVED",
  decidedAt: "2026-10-17T22:34:00Z",
  decidedByName: "Carlos M.",
  decisionNote: null,
};

const APPROVED_CANCELLATION: StaffOrderHistoryEntry = {
  fromStatus: "PREPARING",
  toStatus: "CANCELLED",
  actorSide: "RESTAURANT",
  actorName: "Carlos M.",
  occurredAt: "2026-10-17T22:34:00Z",
  reason: "TAKING_TOO_LONG",
};

function entriesOf(
  history: readonly StaffOrderHistoryEntry[],
  cancellationRequest: StaffCancellationRequest | null = null,
): HistoryEntryView[] {
  return toHistoryEntries({ history, cancellationRequest, customer: { name: CUSTOMER_NAME } });
}

function linesOf(entries: readonly HistoryEntryView[]): string[][] {
  return entries.map(({ title, detail }: HistoryEntryView): string[] => [title, detail]);
}

describe("toHistoryEntries", () => {
  it("lists the newest change first, with who made it and on which side", () => {
    const entries: HistoryEntryView[] = entriesOf([CREATED, STARTED]);

    expect(linesOf(entries)).toEqual([
      ["Recebido → Em preparo", `${formatClock(STARTED.occurredAt)} · Carlos M. (equipe)`],
      ["Pedido criado", `${formatClock(CREATED.occurredAt)} · Ana P. (cliente)`],
    ]);
  });

  it("colors each change by the status it reached", () => {
    const entries: HistoryEntryView[] = entriesOf([CREATED, STARTED]);

    expect(entries.map((entry: HistoryEntryView): string => entry.dot)).toEqual([
      ORDER_STATUS_TONES.PREPARING.dot,
      ORDER_STATUS_TONES.RECEIVED.dot,
    ]);
  });

  it("shows the reason and the note of a cancellation", () => {
    const [cancellation]: HistoryEntryView[] = entriesOf([CREATED, STARTED, CANCELLED]);

    expect(cancellation).toMatchObject({
      title: "Em preparo → Cancelado",
      reason: "Motivo: Item indisponível",
      note: "Acabou o pão",
    });
  });

  it("shows no reason nor note for a plain status change", () => {
    const [started]: HistoryEntryView[] = entriesOf([STARTED]);

    expect(started).toMatchObject({ reason: null, note: null });
  });

  it("lists the customer's cancellation request when it was made, with its reason and note", () => {
    const [request]: HistoryEntryView[] = entriesOf([CREATED, STARTED], PENDING_REQUEST);

    expect(request).toEqual({
      key: expect.any(String),
      dot: REQUEST_DOT,
      title: "Cancelamento solicitado",
      detail: `${formatClock(PENDING_REQUEST.requestedAt)} · Ana P. (cliente)`,
      reason: "Motivo: Está demorando",
      note: "Já faz meia hora",
    });
  });

  it("lists a declined request when it was decided, by the staff member, with the note for the customer", () => {
    const entries: HistoryEntryView[] = entriesOf([CREATED, STARTED], DECLINED_REQUEST);

    expect(linesOf(entries)).toEqual([
      ["Cancelamento recusado", `${formatClock("2026-10-17T22:34:00Z")} · Carlos M. (equipe)`],
      ["Cancelamento solicitado", `${formatClock(PENDING_REQUEST.requestedAt)} · Ana P. (cliente)`],
      ["Recebido → Em preparo", `${formatClock(STARTED.occurredAt)} · Carlos M. (equipe)`],
      ["Pedido criado", `${formatClock(CREATED.occurredAt)} · Ana P. (cliente)`],
    ]);
    expect(entries[0]).toMatchObject({ reason: null, note: "Já está saindo" });
  });

  it("lists an approved request next to the cancellation it caused", () => {
    const entries: HistoryEntryView[] = entriesOf(
      [CREATED, STARTED, APPROVED_CANCELLATION],
      APPROVED_REQUEST,
    );

    expect(entries.map((entry: HistoryEntryView): string => entry.title)).toEqual([
      "Em preparo → Cancelado",
      "Cancelamento aprovado",
      "Cancelamento solicitado",
      "Recebido → Em preparo",
      "Pedido criado",
    ]);
    expect(new Set(entries.map((entry: HistoryEntryView): string => entry.key)).size).toBe(5);
  });
});
