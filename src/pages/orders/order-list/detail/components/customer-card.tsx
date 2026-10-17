import { UserRound } from "lucide-react";
import type { JSX } from "react";
import type { StaffOrder } from "@/@types/orders";
import { ORDER_DETAIL_MESSAGES } from "../constants/messages";

interface CustomerCardProps {
  customer: StaffOrder["customer"];
}

export function CustomerCard({ customer }: CustomerCardProps): JSX.Element {
  return (
    <section
      aria-label={ORDER_DETAIL_MESSAGES.CUSTOMER}
      className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm"
    >
      <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-semibold break-words">{customer.name}</span>
        <span className="break-words text-muted-foreground">{customer.email}</span>
      </div>
    </section>
  );
}
