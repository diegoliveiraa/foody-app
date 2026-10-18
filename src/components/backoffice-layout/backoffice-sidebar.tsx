import { LogOut } from "lucide-react";
import { useId, type JSX, type ReactElement } from "react";
import { NavLink, useMatch } from "react-router";
import { AccountSummary } from "@/components/account-summary";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar, type SidebarContextProps } from "@/components/ui/sidebar-context";
import { MESSAGES } from "@/constants/messages";
import { useLogout } from "@/hooks/use-logout";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import type { NavigationItem, NavigationModule } from "@/routes/types";
import { screenBadgeFor } from "./screen-badges";

function ModuleItem({ item }: { item: NavigationItem }): JSX.Element {
  const { setOpenMobile }: SidebarContextProps = useSidebar();
  const active: boolean = useMatch({ path: item.path, end: false }) !== null;
  const Icon: NavigationItem["icon"] = item.icon;
  const badge: ReactElement | null = screenBadgeFor(item.key);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <NavLink to={item.path} onClick={(): void => setOpenMobile(false)}>
          <Icon aria-hidden="true" strokeWidth={1.75} />
          <span>{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
      {badge}
    </SidebarMenuItem>
  );
}

function ModuleGroup({ module }: { module: NavigationModule }): JSX.Element {
  const labelId: string = useId();

  return (
    <SidebarGroup role="group" aria-labelledby={labelId}>
      <SidebarGroupLabel id={labelId}>{module.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {module.items.map((item: NavigationItem): JSX.Element => (
            <ModuleItem key={item.key} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function BackofficeSidebar(): JSX.Element {
  const navigation: NavigationModule[] = useNavigationMenu();
  const logout: () => void = useLogout();

  return (
    <Sidebar>
      <SidebarHeader className="px-5 pt-6 pb-3">
        <BrandLogo />
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={MESSAGES.NAVIGATION.MAIN}>
          {navigation.map((module: NavigationModule): JSX.Element => (
            <ModuleGroup key={module.key} module={module} />
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex flex-col gap-3 rounded-lg bg-backoffice p-3">
          <AccountSummary />
          <Button variant="outline" onClick={logout}>
            <LogOut aria-hidden="true" />
            {MESSAGES.NAVIGATION.LOGOUT}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
