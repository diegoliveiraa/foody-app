import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import type { ComponentProps, ElementType, JSX } from "react";
import { badgeVariants } from "./badge-variants";

type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps): JSX.Element {
  const Comp: ElementType = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
