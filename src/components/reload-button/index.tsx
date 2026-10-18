import { RefreshCw } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MESSAGES } from "@/constants/messages";

interface ReloadButtonProps {
  label: string;
  refreshing: boolean;
  onReload: () => void;
}

export function ReloadButton({ label, refreshing, onReload }: ReloadButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={label}
      aria-busy={refreshing}
      disabled={refreshing}
      onClick={onReload}
      className="max-md:w-11 max-md:px-0"
    >
      {refreshing ? <Spinner aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
      <span className="max-md:sr-only">{MESSAGES.ACTIONS.RELOAD}</span>
    </Button>
  );
}
