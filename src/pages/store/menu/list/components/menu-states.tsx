import { CircleAlert, SearchX, UtensilsCrossed } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_PRODUCTS, SKELETON_SECTIONS } from "../constants";
import { MENU_MESSAGES } from "../constants/messages";

function indexes(count: number): number[] {
  return Array.from({ length: count }, (_item: unknown, index: number): number => index);
}

export function MenuSkeleton(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={MENU_MESSAGES.LOADING} className="flex flex-col gap-5">
      {indexes(SKELETON_SECTIONS).map((section: number): JSX.Element => (
        <div key={section} className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-32" />
          {indexes(SKELETON_PRODUCTS).map((product: number): JSX.Element => (
            <Skeleton key={product} className="h-30 w-full rounded-[18px]" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MenuLoadError({ detail }: { detail: string }): JSX.Element {
  return <EmptyState icon={CircleAlert} title={MENU_MESSAGES.LOAD_FAILED} description={detail} />;
}

export function MenuEmpty(): JSX.Element {
  return (
    <EmptyState
      icon={UtensilsCrossed}
      title={MENU_MESSAGES.EMPTY}
      description={MENU_MESSAGES.EMPTY_DESCRIPTION}
    />
  );
}

export function MenuNoResults({ onClear }: { onClear: () => void }): JSX.Element {
  return (
    <EmptyState icon={SearchX} title={MENU_MESSAGES.NO_RESULTS}>
      <Button variant="outline" onClick={onClear}>
        {MENU_MESSAGES.CLEAR_SEARCH}
      </Button>
    </EmptyState>
  );
}
