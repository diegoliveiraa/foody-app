import type { JSX } from "react";
import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { SCREEN_KEYS } from "@/constants/screens";

export function OrderListScreen(): JSX.Element {
  return <ScreenPlaceholder screenKey={SCREEN_KEYS.ORDERS_ORDER_LIST} />;
}
