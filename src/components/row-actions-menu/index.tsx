import { MoreHorizontal } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MESSAGES } from "@/constants/messages";
import type { RowAction } from "./types";

interface RowActionsMenuProps {
  name: string;
  items: readonly RowAction[];
}

export function RowActionsMenu({ name, items }: RowActionsMenuProps): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={MESSAGES.ACTIONS.FOR(name)}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {items.map((item: RowAction): JSX.Element => (
          <DropdownMenuItem key={item.label} variant={item.variant} onSelect={item.select}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
