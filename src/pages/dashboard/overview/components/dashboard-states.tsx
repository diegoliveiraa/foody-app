import { CircleAlert } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGES } from "@/constants/messages";
import { SKELETON_KPIS, SKELETON_SECTIONS } from "../constants";
import { DASHBOARD_MESSAGES } from "../constants/messages";

interface DashboardLoadErrorProps {
  detail: string;
  onRetry: () => void;
}

export function DashboardSkeleton(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={DASHBOARD_MESSAGES.LOADING} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {Array.from({ length: SKELETON_KPIS }, (_card: unknown, index: number): JSX.Element => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from(
          { length: SKELETON_SECTIONS },
          (_section: unknown, index: number): JSX.Element => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ),
        )}
      </div>
    </div>
  );
}

export function DashboardLoadError({ detail, onRetry }: DashboardLoadErrorProps): JSX.Element {
  return (
    <EmptyState icon={CircleAlert} title={DASHBOARD_MESSAGES.LOAD_FAILED} description={detail}>
      <Button variant="outline" onClick={onRetry}>
        {MESSAGES.ACTIONS.RETRY}
      </Button>
    </EmptyState>
  );
}
