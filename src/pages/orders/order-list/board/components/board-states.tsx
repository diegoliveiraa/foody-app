import { CircleAlert } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_CARDS, SKELETON_COLUMNS } from "../constants";
import { BOARD_MESSAGES } from "../constants/messages";

function indexes(count: number): number[] {
  return Array.from({ length: count }, (_item: unknown, index: number): number => index);
}

export function BoardSkeleton(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={BOARD_MESSAGES.LOADING} className="grid gap-4 lg:grid-cols-3">
      {indexes(SKELETON_COLUMNS).map((column: number): JSX.Element => (
        <div key={column} className="flex flex-col gap-2.5 max-lg:not-first:hidden">
          {indexes(SKELETON_CARDS).map((card: number): JSX.Element => (
            <Skeleton key={card} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function BoardLoadError({ detail }: { detail: string }): JSX.Element {
  return <EmptyState icon={CircleAlert} title={BOARD_MESSAGES.LOAD_FAILED} description={detail} />;
}
