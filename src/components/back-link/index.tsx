import { ChevronLeft } from "lucide-react";
import type { JSX } from "react";
import { Link, type To } from "react-router";
import { Button } from "@/components/ui/button";

interface BackLinkProps {
  to: To;
  label: string;
}

export function BackLink({ to, label }: BackLinkProps): JSX.Element {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="-ml-2 shrink-0 [&_svg:not([class*='size-'])]:size-[22px]"
    >
      <Link to={to} aria-label={label}>
        <ChevronLeft aria-hidden="true" />
      </Link>
    </Button>
  );
}
