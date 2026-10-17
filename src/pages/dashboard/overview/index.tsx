import type { JSX } from "react";
import { ScreenPlaceholder } from "@/components/screen-placeholder";
import { SCREEN_KEYS } from "@/constants/screens";

export function OverviewScreen(): JSX.Element {
  return <ScreenPlaceholder screenKey={SCREEN_KEYS.DASHBOARD_OVERVIEW} />;
}
