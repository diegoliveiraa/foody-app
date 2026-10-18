import { TriangleAlert } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";

function reload(): void {
  window.location.reload();
}

export function UnexpectedErrorScreen(): JSX.Element {
  return (
    <section className="flex flex-1 items-center px-4 py-10 md:px-8">
      <EmptyState
        icon={TriangleAlert}
        title={MESSAGES.UNEXPECTED.TITLE}
        description={MESSAGES.UNEXPECTED.DESCRIPTION}
      >
        <Button variant="outline" onClick={reload}>
          {MESSAGES.ACTIONS.RETRY}
        </Button>
      </EmptyState>
    </section>
  );
}
