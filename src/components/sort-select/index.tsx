import { useId, type JSX } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MESSAGES } from "@/constants/messages";
import { sortOfOption, sortOptionValue, type SortOption } from "@/utils/sort-options";
import { toSortParam, type SortOrder } from "@/utils/sort-param";

interface SortSelectProps {
  options: readonly SortOption[];
  sort: SortOrder;
  onChange: (sort: SortOrder) => void;
}

export function SortSelect({ options, sort, onChange }: SortSelectProps): JSX.Element {
  const id: string = useId();

  const choose = (value: string): void => {
    const chosen: SortOrder | undefined = sortOfOption(options, value);
    if (chosen === undefined) {
      return;
    }
    onChange(chosen);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Label htmlFor={id} className="shrink-0 font-normal text-muted-foreground">
        {MESSAGES.LIST.SORT_BY}
      </Label>
      <Select value={sortOptionValue(options, sort)} onValueChange={choose}>
        <SelectTrigger id={id} className="min-w-0 flex-1 sm:w-52 sm:flex-none">
          <SelectValue placeholder={MESSAGES.LIST.SORT_BY} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: SortOption): JSX.Element => (
            <SelectItem key={toSortParam(option.sort)} value={toSortParam(option.sort)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
