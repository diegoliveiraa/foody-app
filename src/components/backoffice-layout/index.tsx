import type { JSX } from "react";
import { Outlet } from "react-router";
import { PageHeaderLeadingContext } from "@/components/page-header/leading-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BackofficeSidebar } from "./backoffice-sidebar";
import { useLiveActiveOrders } from "./hooks/use-live-active-orders";
import { MenuButton } from "./menu-button";

export function BackofficeLayout(): JSX.Element {
  useLiveActiveOrders();

  return (
    <SidebarProvider>
      <BackofficeSidebar />
      <SidebarInset className="bg-backoffice">
        <PageHeaderLeadingContext value={<MenuButton />}>
          <Outlet />
        </PageHeaderLeadingContext>
      </SidebarInset>
    </SidebarProvider>
  );
}
