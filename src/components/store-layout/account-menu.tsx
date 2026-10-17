import { ChevronDown, LogOut, UserRound } from "lucide-react";
import type { JSX } from "react";
import { AccountSummary } from "@/components/account-summary";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MESSAGES } from "@/constants/messages";
import { useLogout } from "@/hooks/use-logout";

export function AccountMenu(): JSX.Element {
  const logout: () => void = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <UserRound aria-hidden="true" />
          {MESSAGES.NAVIGATION.ACCOUNT}
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <AccountSummary />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut aria-hidden="true" />
          {MESSAGES.NAVIGATION.LOGOUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
