import type { JSX } from "react";
import { FilterSelect } from "@/components/filter-select";
import { SearchInput } from "@/components/search-input";
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

export function UsersToolbar({ filter, actions }: UsersToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchInput
        label={USERS_MESSAGES.SEARCH}
        value={filter.search}
        onValueChange={actions.changeSearch}
        className="lg:max-w-sm lg:flex-1"
      />
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
