import type { JSX } from "react";
import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { SCREEN_KEYS } from "@/constants/screens";

export function ProductsScreen(): JSX.Element {
  return <ScreenPlaceholder screenKey={SCREEN_KEYS.CATALOG_PRODUCTS} />;
}
