import { cn } from "cn";
import type { JSX } from "react";
import type { MeUser } from "@/@types/me";
import { useCurrentUser } from "@/hooks/use-current-user";

interface AccountSummaryProps {
  className?: string;
}

export function AccountSummary({ className }: AccountSummaryProps): JSX.Element {
  const user: MeUser | undefined = useCurrentUser();

  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5 text-left", className)}>
      <span className="truncate text-[15px] font-semibold text-foreground">{user?.name}</span>
      <span className="truncate text-[13px] text-muted-foreground">{user?.email}</span>
    </div>
  );
}
