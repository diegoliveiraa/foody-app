import type { ChangeEvent, JSX } from "react";
import { FilterSelect } from "@/components/filter-select";
import { FormField } from "@/components/form-field";
import { SearchInput } from "@/components/search-input";
import { STATUS_FILTERS } from "../constants";
import { HISTORY_MESSAGES, STATUS_FILTER_LABELS } from "../constants/messages";
import type { HistoryFilterActions, HistoryFilterState, StatusFilter } from "../filter/types";

interface HistoryToolbarProps {
  filter: HistoryFilterState;
  actions: HistoryFilterActions;
}

export function HistoryToolbar({ filter, actions }: HistoryToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <SearchInput
        label={HISTORY_MESSAGES.SEARCH}
        value={filter.search}
        onValueChange={actions.changeSearch}
        className="lg:max-w-sm lg:flex-1"
      />
      <FilterSelect<StatusFilter>
        label={HISTORY_MESSAGES.STATUS_FILTER}
        value={filter.status}
        options={STATUS_FILTERS}
        labels={STATUS_FILTER_LABELS}
        onChange={actions.changeStatus}
      />
      <div className="grid grid-cols-2 gap-3 lg:flex">
        <FormField
          label={HISTORY_MESSAGES.FROM}
          type="date"
          value={filter.from}
          onChange={(event: ChangeEvent<HTMLInputElement>): void =>
            actions.changeFrom(event.target.value)
          }
          className="h-11 px-2.5 text-sm lg:w-40"
        />
        <FormField
          label={HISTORY_MESSAGES.TO}
          type="date"
          value={filter.to}
          onChange={(event: ChangeEvent<HTMLInputElement>): void =>
            actions.changeTo(event.target.value)
          }
          className="h-11 px-2.5 text-sm lg:w-40"
        />
      </div>
    </div>
  );
}
