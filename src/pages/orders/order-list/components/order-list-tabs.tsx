import type { JSX } from "react";
import { NavLink } from "react-router";
import { useOrderListPaths } from "@/hooks/use-order-list-paths";
import type { OrderListPaths } from "@/routes/types";
import { ORDER_LIST_MESSAGES } from "../constants/messages";

const TAB_CLASS: string =
  "flex h-10 items-center rounded-[9px] px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-card aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:shadow-xs";

export function OrderListTabs(): JSX.Element {
  const paths: OrderListPaths = useOrderListPaths();

  return (
    <nav
      aria-label={ORDER_LIST_MESSAGES.VIEWS}
      className="flex w-fit gap-1 rounded-xl bg-border p-1"
    >
      <NavLink to={paths.board} end className={TAB_CLASS}>
        {ORDER_LIST_MESSAGES.ACTIVE}
      </NavLink>
      <NavLink to={paths.history} className={TAB_CLASS}>
        {ORDER_LIST_MESSAGES.HISTORY}
      </NavLink>
    </nav>
  );
}
