import { use, type JSX, type ReactNode } from "react";
import { PageHeaderLeadingContext } from "./leading-context";

interface PageHeaderProps {
  title?: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps): JSX.Element {
  const leading: ReactNode = use(PageHeaderLeadingContext);

  return (
    <header className="flex min-h-16 items-center gap-1 px-4 pt-4 pb-2 md:px-8 md:pt-8 md:pb-4">
      {leading}
      <h1 className="min-w-0 flex-1 truncate text-[26px] leading-tight font-bold md:text-3xl">
        {title}
      </h1>
      {children}
    </header>
  );
}
