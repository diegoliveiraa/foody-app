import { CircleAlert, UserSearch } from "lucide-react";
import type { JSX } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { USERS_MESSAGES } from "../constants/messages";

interface UsersEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function UsersEmptyState({ hasFilters, onClearFilters }: UsersEmptyStateProps): JSX.Element {
  return (
    <EmptyState icon={UserSearch} title={USERS_MESSAGES.EMPTY}>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          {USERS_MESSAGES.CLEAR_FILTERS}
        </Button>
      )}
    </EmptyState>
  );
}

export function UsersLoadError({ detail }: { detail: string }): JSX.Element {
  return <EmptyState icon={CircleAlert} title={USERS_MESSAGES.LOAD_FAILED} description={detail} />;
}
