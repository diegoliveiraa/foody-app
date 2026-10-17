import { cn } from "cn";
import type { ComponentProps, JSX } from "react";

function Skeleton({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
