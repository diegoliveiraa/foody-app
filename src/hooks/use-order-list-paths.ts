import { useMemo } from "react";
import type { OrderId } from "@/@types/orders";
import { HISTORY_SEGMENT } from "@/constants/routes";
import { SCREEN_KEYS } from "@/constants/screens";
import { joinPath } from "@/routes/navigation";
import type { OrderListPaths } from "@/routes/types";
import { useScreenPath } from "./use-screen-path";

export function useOrderListPaths(): OrderListPaths {
  const board: string = useScreenPath(SCREEN_KEYS.ORDERS_ORDER_LIST);
  return useMemo(
    (): OrderListPaths => ({
      board,
      history: joinPath(board, HISTORY_SEGMENT),
      detail: (id: OrderId): string => joinPath(board, id),
    }),
    [board],
  );
}
