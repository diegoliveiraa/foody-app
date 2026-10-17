import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps, JSX } from "react";
import { emptyMediaVariants } from "./empty-variants";

function Empty({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>): JSX.Element {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-slot="empty-title"
      className={cn("font-heading text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: ComponentProps<"p">): JSX.Element {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance",
        className,
      )}
      {...props}
    />
  );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
