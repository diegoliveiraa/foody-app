import { CircleAlert, SearchX } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGES } from "@/constants/messages";

interface OrderNotFoundProps {
  children: ReactNode;
}

interface OrderLoadErrorProps {
  detail: string;
}

export function OrderDetailSkeleton(): JSX.Element {
  return (
    <div aria-busy="true" aria-label={MESSAGES.LOADING} className="flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );
}

export function OrderNotFound({ children }: OrderNotFoundProps): JSX.Element {
  return (
    <EmptyState
      icon={SearchX}
      title={MESSAGES.ORDERS.NOT_FOUND}
      description={MESSAGES.ORDERS.NOT_FOUND_DESCRIPTION}
    >
      {children}
    </EmptyState>
  );
}

export function OrderLoadError({ detail }: OrderLoadErrorProps): JSX.Element {
  return <EmptyState icon={CircleAlert} title={MESSAGES.ORDERS.LOAD_FAILED} description={detail} />;
}
