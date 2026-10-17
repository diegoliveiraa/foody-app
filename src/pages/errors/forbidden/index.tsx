import { ShieldX } from "lucide-react";
import type { JSX } from "react";
import { BackHomeLink } from "@/components/back-home-link";
import { EmptyState } from "@/components/empty-state";
import { MESSAGES } from "@/constants/messages";

export function ForbiddenScreen(): JSX.Element {
  return (
    <section className="flex flex-1 items-center px-4 py-10 md:px-8">
      <EmptyState
        icon={ShieldX}
        title={MESSAGES.FORBIDDEN.TITLE}
        description={MESSAGES.FORBIDDEN.DESCRIPTION}
      >
        <BackHomeLink />
      </EmptyState>
    </section>
  );
}
