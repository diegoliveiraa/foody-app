import type { JSX } from "react";
import { Outlet } from "react-router";
import type { NavigationItem } from "@/routes/types";
import { BottomTabs } from "./bottom-tabs";
import { useStoreTabs } from "./hooks/use-store-tabs";
import { TopBar } from "./top-bar";

export function StoreLayout(): JSX.Element {
  const tabs: NavigationItem[] = useStoreTabs();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <TopBar items={tabs} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] md:pb-8">
        <Outlet />
      </main>
      <BottomTabs items={tabs} />
    </div>
  );
}
