import type { LucideIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  asPageTitle?: boolean;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  asPageTitle = false,
  children,
}: EmptyStateProps): JSX.Element {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{asPageTitle ? <h1>{title}</h1> : title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
