import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { MENU_MESSAGES } from "../constants/messages";
import type { CategoryChoice } from "../filter/types";
import type { CategoryChip } from "../types";

interface CategoryChipsProps {
  chips: readonly CategoryChip[];
  selected: CategoryChoice;
  onSelect: (categoryId: CategoryChoice) => void;
}

export function CategoryChips({ chips, selected, onSelect }: CategoryChipsProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label={MENU_MESSAGES.CATEGORIES}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
    >
      {chips.map((chip: CategoryChip): JSX.Element => {
        const pressed: boolean = chip.id === selected;
        return (
          <Button
            key={chip.id}
            type="button"
            variant={pressed ? "default" : "outline"}
            aria-pressed={pressed}
            onClick={(): void => onSelect(chip.id)}
            className="shrink-0 rounded-full px-4 font-medium aria-pressed:font-semibold"
          >
            {chip.label}
          </Button>
        );
      })}
    </div>
  );
}
