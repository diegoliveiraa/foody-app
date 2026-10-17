import type { JSX } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Spinner } from "@/components/ui/spinner";

export function SplashScreen(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
      <BrandLogo className="text-[40px]" />
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
