import type { JSX } from "react";
import { SidebarMenuBadge } from "@/components/ui/sidebar";
import { MESSAGES } from "@/constants/messages";
import { formatCount } from "@/utils/format-number";
import { useActiveOrdersCount } from "./hooks/use-active-orders-count";

const NO_ACTIVE_ORDERS: number = 0;

export function ActiveOrdersBadge(): JSX.Element | null {
  const count: number = useActiveOrdersCount();

  if (count === NO_ACTIVE_ORDERS) {
    return null;
  }
  return (
    <SidebarMenuBadge>
      <span aria-hidden="true">{formatCount(count)}</span>
      <span className="sr-only">{MESSAGES.NAVIGATION.ACTIVE_ORDERS(count)}</span>
    </SidebarMenuBadge>
  );
}
