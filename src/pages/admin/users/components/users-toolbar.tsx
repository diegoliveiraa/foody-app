import { Search } from "lucide-react";
import type { ChangeEvent, JSX } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_FILTERS, STATUS_FILTERS } from "../constants";
import { ROLE_FILTER_LABELS, STATUS_FILTER_LABELS, USERS_MESSAGES } from "../constants/messages";
import type {
  RoleFilter,
  StatusFilter,
  UsersFilterActions,
  UsersFilterState,
} from "../filter/types";

interface UsersToolbarProps {
  filter: UsersFilterState;
  actions: UsersFilterActions;
}

interface FilterSelectProps<TValue extends string> {
  label: string;
  value: TValue;
  options: readonly TValue[];
  labels: Record<TValue, string>;
  onChange: (value: TValue) => void;
}

function FilterSelect<TValue extends string>({
  label,
  value,
  options,
  labels,
  onChange,
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
      <SelectTrigger aria-label={label} className="w-full lg:w-48">
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

export function UsersToolbar({ filter, actions }: UsersToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative lg:max-w-sm lg:flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          aria-label={USERS_MESSAGES.SEARCH}
          placeholder={USERS_MESSAGES.SEARCH}
          value={filter.search}
          onChange={(event: ChangeEvent<HTMLInputElement>): void =>
            actions.changeSearch(event.target.value)
          }
          className="h-11 pl-10"
        />
      </div>
      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,3fr)] gap-3 lg:flex">
        <FilterSelect<RoleFilter>
          label={USERS_MESSAGES.ROLE_FILTER}
          value={filter.role}
          options={ROLE_FILTERS}
          labels={ROLE_FILTER_LABELS}
          onChange={actions.changeRole}
        />
        <FilterSelect<StatusFilter>
          label={USERS_MESSAGES.STATUS_FILTER}
          value={filter.status}
          options={STATUS_FILTERS}
          labels={STATUS_FILTER_LABELS}
          onChange={actions.changeStatus}
        />
      </div>
    </div>
  );
}
