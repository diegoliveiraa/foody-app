import { cn } from "cn";
import type { JSX } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps<TValue extends string> {
  label: string;
  value: TValue;
  options: readonly TValue[];
  labels: Readonly<Record<TValue, string>>;
  onChange: (value: TValue) => void;
  className?: string;
}

export function FilterSelect<TValue extends string>({
  label,
  value,
  options,
  labels,
  onChange,
  className,
}: FilterSelectProps<TValue>): JSX.Element {
  const choose = (chosen: string): void => {
    const option: TValue | undefined = options.find((known: TValue): boolean => known === chosen);
    if (option === undefined) {
      return;
    }
    onChange(option);
  };

  return (
    <Select value={value} onValueChange={choose}>
      <SelectTrigger aria-label={label} className={cn("w-full min-w-0 lg:w-48", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: TValue): JSX.Element => (
          <SelectItem key={option} value={option}>
            {labels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
