import type { JSX, ReactNode } from "react";
import type { OrderItem } from "@/@types/orders";
import { Separator } from "@/components/ui/separator";
import { MESSAGES } from "@/constants/messages";
import { formatMoney } from "@/utils/format-money";

interface OrderItemsCardProps {
  items: readonly OrderItem[];
  total: number;
  children?: ReactNode;
}

export function OrderItemsCard({ items, total, children }: OrderItemsCardProps): JSX.Element {
  return (
    <section
      aria-label={MESSAGES.ORDERS.ITEMS}
      className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4"
    >
      <h2 className="font-sans text-base font-bold">{MESSAGES.ORDERS.ITEMS}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item: OrderItem): JSX.Element => (
          <li key={item.productId} className="flex justify-between gap-3 text-[15px]">
            <span className="min-w-0 break-words">
              {MESSAGES.ORDERS.ITEM_LINE(item.quantity, item.productName)}
            </span>
            <span className="shrink-0">{formatMoney(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex justify-between gap-3 text-[17px] font-bold">
        <span>{MESSAGES.ORDERS.TOTAL}</span>
        <span>{formatMoney(total)}</span>
      </div>
      {children}
    </section>
  );
}
