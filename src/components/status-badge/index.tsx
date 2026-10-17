import type { VariantProps } from "class-variance-authority";
import type { JSX } from "react";
import type { CatalogStatus } from "@/@types/catalog";
import { Badge } from "@/components/ui/badge";
import type { badgeVariants } from "@/components/ui/badge-variants";
import { CATALOG_STATUSES } from "@/constants/catalog";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

interface StatusBadgeProps {
  status: CatalogStatus;
  label: string;
}

const STATUS_VARIANTS: Record<CatalogStatus, BadgeVariant> = {
  [CATALOG_STATUSES.ACTIVE]: "outline",
  [CATALOG_STATUSES.DISABLED]: "destructive",
};

export function StatusBadge({ status, label }: StatusBadgeProps): JSX.Element {
  return <Badge variant={STATUS_VARIANTS[status]}>{label}</Badge>;
}
