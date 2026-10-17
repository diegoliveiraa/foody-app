import { cn } from "cn";
import type { JSX } from "react";
import { MESSAGES } from "@/constants/messages";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps): JSX.Element {
  return (
    <span
      className={cn(
        "font-heading text-[26px] leading-none font-extrabold tracking-tight text-primary",
        className,
      )}
    >
      {MESSAGES.BRAND}
    </span>
  );
}
