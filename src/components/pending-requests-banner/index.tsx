import { ChevronRight, TriangleAlert } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

interface PendingRequestsBannerProps {
  label: string;
  to: string;
}

export function PendingRequestsBanner({ label, to }: PendingRequestsBannerProps): JSX.Element {
  return (
    <Link
      to={to}
      className="flex min-h-12 items-center gap-2.5 rounded-[14px] border border-attention-soft-border bg-attention px-3.5 py-3 text-sm font-semibold text-attention-foreground transition-colors outline-none hover:border-attention-border focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <TriangleAlert aria-hidden="true" className="size-[18px] shrink-0" />
      <span className="min-w-0 flex-1">{label}</span>
      <ChevronRight aria-hidden="true" className="size-[18px] shrink-0" />
    </Link>
  );
}
