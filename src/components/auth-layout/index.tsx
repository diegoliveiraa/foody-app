import type { JSX } from "react";
import { Outlet } from "react-router";
import { BrandLogo } from "@/components/brand-logo";
import { MESSAGES } from "@/constants/messages";

function AuthHero(): JSX.Element {
  return (
    <section className="relative flex h-[300px] shrink-0 flex-col gap-3 overflow-hidden bg-primary px-6 pt-14 text-primary-foreground md:h-auto md:w-1/2 md:justify-center md:px-16 md:pt-0 lg:w-[45%]">
      <span
        aria-hidden="true"
        className="absolute -top-10 -right-15 size-55 rounded-full bg-white/8 md:size-96"
      />
      <span
        aria-hidden="true"
        className="absolute top-37.5 right-10 size-30 rounded-full bg-white/6 md:top-auto md:bottom-24"
      />
      <BrandLogo className="relative text-[40px] tracking-[-1px] text-primary-foreground md:text-6xl" />
      <p className="relative max-w-65 text-lg leading-snug text-brand-soft md:max-w-80 md:text-xl">
        {MESSAGES.TAGLINE}
      </p>
    </section>
  );
}

export function AuthLayout(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <AuthHero />
      <main className="relative -mt-8 flex flex-1 flex-col rounded-t-[28px] bg-background px-6 pt-7 pb-10 md:mt-0 md:items-center md:justify-center md:rounded-none md:px-12">
        <div className="flex w-full max-w-sm flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
