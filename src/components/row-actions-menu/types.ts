import type { ComponentProps } from "react";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export type RowActionVariant = ComponentProps<typeof DropdownMenuItem>["variant"];

export interface RowAction {
  label: string;
  variant: RowActionVariant;
  select: () => void;
}
