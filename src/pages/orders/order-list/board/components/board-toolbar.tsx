import type { JSX } from "react";
import { useNow } from "@/hooks/use-now";
import { formatUpdatedAgo } from "@/utils/format-order-date";

export function UpdatedAgo({ updatedAt }: { updatedAt: number | null }): JSX.Element | null {
  const now: number = useNow();

  if (updatedAt === null) {
    return null;
  }
  return (
    <span className="text-[13px] whitespace-nowrap text-muted-foreground">
      {formatUpdatedAgo(updatedAt, now)}
    </span>
  );
}
