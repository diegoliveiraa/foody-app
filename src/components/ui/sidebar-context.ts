import { createContext, useContext } from "react";

export const SIDEBAR_STATES = {
  EXPANDED: "expanded",
  COLLAPSED: "collapsed",
} as const;

export type SidebarState = (typeof SIDEBAR_STATES)[keyof typeof SIDEBAR_STATES];

export interface SidebarContextProps {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const OUTSIDE_PROVIDER_ERROR: string = "useSidebar must be used within a SidebarProvider.";

export const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar(): SidebarContextProps {
  const context: SidebarContextProps | null = useContext(SidebarContext);
  if (!context) {
    throw new Error(OUTSIDE_PROVIDER_ERROR);
  }
  return context;
}
