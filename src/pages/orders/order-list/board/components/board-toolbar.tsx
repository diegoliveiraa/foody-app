import { RefreshCw } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useNow } from "@/hooks/use-now";
import { formatUpdatedAgo } from "@/utils/format-order-date";
import { BOARD_MESSAGES } from "../constants/messages";

interface ReloadButtonProps {
  refreshing: boolean;
  onReload: () => void;
}

export function UpdatedAgo({ updatedAt }: { updatedAt: number | null }): JSX.Element | null {
  const now: number = useNow();

  if (updatedAt === null) {
    return null;
  }
  return (
    <span className="text-[13px] whitespace-nowrap text-muted-foreground">
      {formatUpdatedAgo(updatedAt, now)}
    </span>
  );
}

export function ReloadButton({ refreshing, onReload }: ReloadButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={BOARD_MESSAGES.RELOAD_LABEL}
      aria-busy={refreshing}
      disabled={refreshing}
      onClick={onReload}
      className="max-md:w-11 max-md:px-0"
    >
      {refreshing ? <Spinner aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
      <span className="max-md:sr-only">{BOARD_MESSAGES.RELOAD}</span>
    </Button>
  );
}
