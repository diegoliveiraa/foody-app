import { describe, expect, it } from "vitest";
import type { StaffOrderHistoryEntry } from "@/@types/orders";
import { formatClock } from "@/utils/format-order-date";
import type { HistoryEntryView } from "../types";
import { toHistoryEntries } from "./history-entries";

const CREATED: StaffOrderHistoryEntry = {
  fromStatus: null,
  toStatus: "RECEIVED",
  actorSide: "CUSTOMER",
  actorName: "Ana P.",
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

describe("toHistoryEntries", () => {
  it("lists the newest change first, with who made it and on which side", () => {
    const entries: HistoryEntryView[] = toHistoryEntries([CREATED, STARTED]);

    expect(entries.map(({ title, detail }: HistoryEntryView): string[] => [title, detail])).toEqual(
      [
        ["Recebido → Em preparo", `${formatClock(STARTED.occurredAt)} · Carlos M. (equipe)`],
        ["Pedido criado", `${formatClock(CREATED.occurredAt)} · Ana P. (cliente)`],
      ],
    );
  });

  it("colors each entry by the status it reached", () => {
    const entries: HistoryEntryView[] = toHistoryEntries([CREATED, STARTED]);

    expect(entries.map((entry: HistoryEntryView): string => entry.status)).toEqual([
      "PREPARING",
      "RECEIVED",
    ]);
  });

  it("shows the reason and the note of a cancellation", () => {
    const [cancellation]: HistoryEntryView[] = toHistoryEntries([CREATED, STARTED, CANCELLED]);

    expect(cancellation).toMatchObject({
      title: "Em preparo → Cancelado",
      reason: "Motivo: Item indisponível",
      note: "Acabou o pão",
    });
  });

  it("shows no reason nor note for a plain status change", () => {
    const [started]: HistoryEntryView[] = toHistoryEntries([STARTED]);

    expect(started).toMatchObject({ reason: null, note: null });
  });
});
