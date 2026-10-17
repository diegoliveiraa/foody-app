import { MapPinOff } from "lucide-react";
import type { JSX } from "react";
import { BackHomeLink } from "@/components/back-home-link";
import { EmptyState } from "@/components/empty-state";
import { MESSAGES } from "@/constants/messages";

export function NotFoundScreen(): JSX.Element {
  return (
    <main className="flex min-h-svh items-center bg-background px-4 py-10">
      <EmptyState
        icon={MapPinOff}
        title={MESSAGES.NOT_FOUND.TITLE}
        description={MESSAGES.NOT_FOUND.DESCRIPTION}
      >
        <BackHomeLink />
      </EmptyState>
    </main>
  );
}
