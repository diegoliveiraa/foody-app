import { LogOut } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { AccountSummary } from "@/components/account-summary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MESSAGES } from "@/constants/messages";
import { useLogout } from "@/hooks/use-logout";

interface AccountSheetProps {
  children: ReactNode;
}

export function AccountSheet({ children }: AccountSheetProps): JSX.Element {
  const logout: () => void = useLogout();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="gap-2 rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-xl font-bold">{MESSAGES.NAVIGATION.ACCOUNT}</SheetTitle>
          <SheetDescription className="sr-only">
            {MESSAGES.NAVIGATION.ACCOUNT_DESCRIPTION}
          </SheetDescription>
        </SheetHeader>
        <AccountSummary className="px-6" />
        <SheetFooter className="px-6 pt-4 pb-6">
          <Button variant="outline" size="lg" onClick={logout}>
            <LogOut aria-hidden="true" />
            {MESSAGES.NAVIGATION.LOGOUT}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
