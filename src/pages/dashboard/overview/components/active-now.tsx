import { cn } from "cn";
import type { JSX } from "react";
import { Link } from "react-router";
import { ORDER_STATUS_TONES } from "@/components/order-status-badge/tones";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { ActiveCount } from "../types";
import { DashboardSection } from "./dashboard-section";

interface ActiveNowProps {
  active: readonly ActiveCount[];
  boardPath: string;
}

export function ActiveNow({ active, boardPath }: ActiveNowProps): JSX.Element {
  return (
    <DashboardSection title={DASHBOARD_MESSAGES.NOW}>
      <ul className="grid grid-cols-3 gap-2">
        {active.map((count: ActiveCount): JSX.Element => (
          <li key={count.status} className="min-w-0">
            <Link
              to={boardPath}
              aria-label={DASHBOARD_MESSAGES.ACTIVE_COUNT(count.count, count.label)}
              className={cn(
                "flex min-h-11 flex-col gap-0.5 rounded-xl px-2.5 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                ORDER_STATUS_TONES[count.status].badge,
              )}
            >
              <span className="font-heading text-2xl leading-none font-bold">{count.count}</span>
              <span className="text-xs font-semibold">{count.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
