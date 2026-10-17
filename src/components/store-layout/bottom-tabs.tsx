import { UserRound } from "lucide-react";
import type { JSX } from "react";
import { NavLink } from "react-router";
import { MESSAGES } from "@/constants/messages";
import type { NavigationItem } from "@/routes/types";
import { AccountSheet } from "./account-sheet";

interface BottomTabsProps {
  items: NavigationItem[];
}

const TAB_CLASS: string =
  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-primary [&_svg]:size-[22px]";

function TabLink({ item }: { item: NavigationItem }): JSX.Element {
  const Icon: NavigationItem["icon"] = item.icon;

  return (
    <NavLink to={item.path} className={TAB_CLASS}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export function BottomTabs({ items }: BottomTabsProps): JSX.Element {
  return (
    <nav
      aria-label={MESSAGES.NAVIGATION.MAIN}
      className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] auto-cols-fr grid-flow-col border-t bg-card px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {items.map((item: NavigationItem): JSX.Element => (
        <TabLink key={item.key} item={item} />
      ))}
      <AccountSheet>
        <button type="button" className={TAB_CLASS}>
          <UserRound aria-hidden="true" strokeWidth={1.75} />
          <span>{MESSAGES.NAVIGATION.ACCOUNT}</span>
        </button>
      </AccountSheet>
    </nav>
  );
}
