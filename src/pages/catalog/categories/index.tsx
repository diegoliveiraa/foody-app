import type { JSX } from "react";
import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { SCREEN_KEYS } from "@/constants/screens";

export function CategoriesScreen(): JSX.Element {
  return <ScreenPlaceholder screenKey={SCREEN_KEYS.CATALOG_CATEGORIES} />;
}
