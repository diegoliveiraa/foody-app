import type { MeScreen } from "@/@types/me";
import { SCREEN_KEYS } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";
import { useGetOrderBoardQuery } from "@/services/orders";
import { livePolling } from "@/utils/live-polling";

export function useLiveActiveOrders(): void {
  const ordersScreen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.ORDERS_ORDER_LIST);
  useGetOrderBoardQuery(undefined, { ...livePolling(true), skip: ordersScreen === undefined });
}
