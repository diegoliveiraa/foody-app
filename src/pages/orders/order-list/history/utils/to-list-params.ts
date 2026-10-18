import type { ListOrdersParams } from "@/@types/orders";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { toSortParam } from "@/utils/sort-param";
import { NO_DATE } from "../constants";
import type { HistoryFilterState } from "../filter/types";

export function toListOrdersParams({
  appliedSearch,
  status,
  appliedFrom,
  appliedTo,
  page,
  pageSize,
  sort,
}: HistoryFilterState): ListOrdersParams {
  const search: string = appliedSearch.trim();
  return {
    ...(search === EMPTY_SEARCH ? {} : { search }),
    ...(status === ALL_FILTER ? {} : { status: [status] }),
    ...(appliedFrom === NO_DATE ? {} : { from: appliedFrom }),
    ...(appliedTo === NO_DATE ? {} : { to: appliedTo }),
    page,
    pageSize,
    sort: [toSortParam(sort)],
  };
}
