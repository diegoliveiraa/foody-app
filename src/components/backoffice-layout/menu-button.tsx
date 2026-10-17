import { Menu } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar, type SidebarContextProps } from "@/components/ui/sidebar-context";
import { MESSAGES } from "@/constants/messages";

export function MenuButton(): JSX.Element {
  const { toggleSidebar }: SidebarContextProps = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2 md:hidden [&_svg:not([class*='size-'])]:size-[22px]"
      aria-label={MESSAGES.NAVIGATION.OPEN_MENU}
      onClick={toggleSidebar}
    >
      <Menu aria-hidden="true" />
    </Button>
  );
}
