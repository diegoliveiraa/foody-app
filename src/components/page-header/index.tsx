import { use, type JSX, type ReactNode } from "react";
import { PageHeaderLeadingContext } from "./leading-context";

interface PageHeaderProps {
  title?: string;
  description?: string;
  back?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, back, children }: PageHeaderProps): JSX.Element {
  const leading: ReactNode = use(PageHeaderLeadingContext);

  return (
    <header className="flex min-h-16 items-center gap-1 px-4 pt-4 pb-2 md:px-8 md:pt-8 md:pb-4">
      {leading}
      {back}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate text-[26px] leading-tight font-bold md:text-3xl">{title}</h1>
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </header>
  );
}
