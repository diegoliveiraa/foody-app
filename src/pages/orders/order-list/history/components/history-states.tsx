import { CircleAlert, SearchX } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { HISTORY_MESSAGES } from "../constants/messages";

interface HistoryEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function HistoryEmptyState({
  hasFilters,
  onClearFilters,
}: HistoryEmptyStateProps): JSX.Element {
  return (
    <EmptyState icon={SearchX} title={HISTORY_MESSAGES.EMPTY}>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          {HISTORY_MESSAGES.CLEAR_FILTERS}
        </Button>
      )}
    </EmptyState>
  );
}

export function HistoryLoadError({ detail }: { detail: string }): JSX.Element {
  return (
    <EmptyState icon={CircleAlert} title={HISTORY_MESSAGES.LOAD_FAILED} description={detail} />
  );
}
