import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties, JSX } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const TOAST_STYLE: CSSProperties = {
  "--normal-bg": "var(--toast)",
  "--normal-text": "var(--toast-foreground)",
  "--normal-border": "var(--toast)",
  "--border-radius": "var(--radius)",
} as CSSProperties;

function Toaster({ ...props }: ToasterProps): JSX.Element {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-toast-success" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-toast-warning" />,
        error: <OctagonXIcon className="size-4 text-toast-warning" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={TOAST_STYLE}
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans shadow-toast",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
