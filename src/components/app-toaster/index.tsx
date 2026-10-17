import type { JSX } from "react";
import type { ToasterProps } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const MOBILE_POSITION: ToasterProps["position"] = "top-center";

const DESKTOP_POSITION: ToasterProps["position"] = "bottom-right";

export function AppToaster(): JSX.Element {
  const isMobile: boolean = useIsMobile();

  return <Toaster position={isMobile ? MOBILE_POSITION : DESKTOP_POSITION} />;
}
