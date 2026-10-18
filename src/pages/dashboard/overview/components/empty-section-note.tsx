import type { JSX, ReactNode } from "react";

export function EmptySectionNote({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
