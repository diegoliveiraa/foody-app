import { useMemo } from "react";
import type { OrderId } from "@/@types/orders";
import { SCREEN_KEYS } from "@/constants/screens";
import { useScreenPath } from "@/hooks/use-screen-path";
import { joinPath } from "@/routes/navigation";
import { HISTORY_SEGMENT } from "../constants";
import type { OrderListPaths } from "../types";

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
