import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import type { ComponentProps, JSX } from "react";
import { MESSAGES } from "@/constants/messages";

function Spinner({ className, ...props }: ComponentProps<"svg">): JSX.Element {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={MESSAGES.LOADING}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
