import { CircleAlert, Receipt } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_CARDS } from "../constants";
import { MY_ORDERS_MESSAGES } from "../constants/messages";

export function MyOrdersSkeleton(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={MY_ORDERS_MESSAGES.LOADING} className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_CARDS }, (_card: unknown, index: number): JSX.Element => (
        <Skeleton key={index} className="h-30 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function MyOrdersEmpty({ menuPath }: { menuPath: string }): JSX.Element {
  return (
    <EmptyState
      icon={Receipt}
      title={MY_ORDERS_MESSAGES.EMPTY}
      description={MY_ORDERS_MESSAGES.EMPTY_DESCRIPTION}
    >
      <Button asChild variant="outline">
        <Link to={menuPath}>{MY_ORDERS_MESSAGES.BROWSE_MENU}</Link>
      </Button>
    </EmptyState>
  );
}

export function MyOrdersLoadError({ detail }: { detail: string }): JSX.Element {
  return (
    <EmptyState icon={CircleAlert} title={MY_ORDERS_MESSAGES.LOAD_FAILED} description={detail} />
  );
}
