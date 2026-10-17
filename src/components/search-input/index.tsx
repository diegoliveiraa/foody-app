import { cn } from "cn";
import { Search } from "lucide-react";
import type { ChangeEvent, JSX } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  label,
  value,
  onValueChange,
  className,
}: SearchInputProps): JSX.Element {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => onValueChange(event.target.value)}
        className="h-11 pl-10"
      />
    </div>
  );
}
