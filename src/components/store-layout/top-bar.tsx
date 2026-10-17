import type { JSX } from "react";
import { NavLink } from "react-router";
import { BrandLogo } from "@/components/brand-logo";
import { MESSAGES } from "@/constants/messages";
import type { NavigationItem } from "@/routes/types";
import { AccountMenu } from "./account-menu";

interface TopBarProps {
  items: NavigationItem[];
}

const LINK_CLASS: string =
  "flex h-11 items-center gap-2 rounded-lg px-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-accent-foreground [&_svg]:size-5";

function TopBarLink({ item }: { item: NavigationItem }): JSX.Element {
  const Icon: NavigationItem["icon"] = item.icon;

  return (
    <NavLink to={item.path} className={LINK_CLASS}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
      {item.label}
    </NavLink>
  );
}

export function TopBar({ items }: TopBarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-40 hidden h-top-bar border-b bg-background/95 backdrop-blur md:block">
      <div className="mx-auto flex h-full max-w-5xl items-center gap-8 px-6">
        <BrandLogo />
        <nav aria-label={MESSAGES.NAVIGATION.MAIN} className="flex flex-1 items-center gap-1">
          {items.map((item: NavigationItem): JSX.Element => (
            <TopBarLink key={item.key} item={item} />
          ))}
        </nav>
        <AccountMenu />
      </div>
    </header>
  );
}
