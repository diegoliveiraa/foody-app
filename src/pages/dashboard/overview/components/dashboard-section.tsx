import { useId, type JSX, type ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({ title, aside, children }: DashboardSectionProps): JSX.Element {
  const headingId: string = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={headingId} className="font-sans text-[15px] font-bold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
