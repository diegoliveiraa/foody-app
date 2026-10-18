import { cn } from "cn";
import type { ChangeEvent, JSX } from "react";
import { FilterSelect } from "@/components/filter-select";
import { FormField } from "@/components/form-field";
import { SearchInput } from "@/components/search-input";
import { STATUS_FILTERS } from "../constants";
import { HISTORY_MESSAGES, STATUS_FILTER_LABELS } from "../constants/messages";
import type { HistoryFilterActions, HistoryFilterState, StatusFilter } from "../filter/types";

const LABEL_ROW_OFFSET: string = "lg:mt-[calc(var(--text-sm)*var(--leading-snug)+--spacing(2))]";

interface HistoryToolbarProps {
  filter: HistoryFilterState;
  actions: HistoryFilterActions;
  invertedRange: boolean;
}

export function HistoryToolbar({
  filter,
  actions,
  invertedRange,
}: HistoryToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <SearchInput
        label={HISTORY_MESSAGES.SEARCH}
        value={filter.search}
        onValueChange={actions.changeSearch}
        className={cn("lg:max-w-sm lg:flex-1", LABEL_ROW_OFFSET)}
      />
      <FilterSelect<StatusFilter>
        label={HISTORY_MESSAGES.STATUS_FILTER}
        value={filter.status}
        options={STATUS_FILTERS}
        labels={STATUS_FILTER_LABELS}
        onChange={actions.changeStatus}
        className={LABEL_ROW_OFFSET}
      />
      <div className="grid grid-cols-2 items-start gap-3 lg:flex">
        <div className="min-w-0 lg:w-40">
          <FormField
            label={HISTORY_MESSAGES.FROM}
            type="date"
            value={filter.from}
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              actions.changeFrom(event.target.value)
            }
            className="h-11 px-2.5 text-sm"
          />
        </div>
        <div className="min-w-0 lg:w-40">
          <FormField
            label={HISTORY_MESSAGES.TO}
            type="date"
            value={filter.to}
            error={invertedRange ? HISTORY_MESSAGES.INVERTED_RANGE : undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              actions.changeTo(event.target.value)
            }
            className="h-11 px-2.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
