import {
  createSlice,
  isAnyOf,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, type PageSize } from "@/constants/pagination";
import {
  DEFAULT_HISTORY_SORT,
  HISTORY_FILTER_NAME,
  NO_DATE,
} from "@/pages/orders/order-list/history/constants";
import type {
  HistoryFilterState,
  StatusFilter,
} from "@/pages/orders/order-list/history/filter/types";
import type { SortOrder } from "@/utils/sort-param";
import { sessionCleared, sessionExpired } from "./session";

export const INITIAL_HISTORY_FILTER: HistoryFilterState = {
  search: EMPTY_SEARCH,
  appliedSearch: EMPTY_SEARCH,
  status: ALL_FILTER,
  from: NO_DATE,
  to: NO_DATE,
  appliedFrom: NO_DATE,
  appliedTo: NO_DATE,
  page: FIRST_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_HISTORY_SORT,
};

export function isInvertedRange(from: string, to: string): boolean {
  return from !== NO_DATE && to !== NO_DATE && to < from;
}

function backToFirstPage(state: HistoryFilterState): void {
  state.page = FIRST_PAGE;
}

function applyDatesInOrder(state: HistoryFilterState): void {
  if (isInvertedRange(state.from, state.to)) {
    return;
  }
  state.appliedFrom = state.from;
  state.appliedTo = state.to;
  backToFirstPage(state);
}

const isSessionEnd = isAnyOf(sessionCleared, sessionExpired);

export const orderHistoryFilterSlice = createSlice({
  name: HISTORY_FILTER_NAME,
  initialState: INITIAL_HISTORY_FILTER,
  reducers: {
    searchChanged: (state: HistoryFilterState, action: PayloadAction<string>): void => {
      state.search = action.payload;
    },
    searchApplied: (state: HistoryFilterState, action: PayloadAction<string>): void => {
      state.appliedSearch = action.payload;
      backToFirstPage(state);
    },
    statusChanged: (state: HistoryFilterState, action: PayloadAction<StatusFilter>): void => {
      state.status = action.payload;
      backToFirstPage(state);
    },
    fromChanged: (state: HistoryFilterState, action: PayloadAction<string>): void => {
      state.from = action.payload;
      applyDatesInOrder(state);
    },
    toChanged: (state: HistoryFilterState, action: PayloadAction<string>): void => {
      state.to = action.payload;
      applyDatesInOrder(state);
    },
    pageChanged: (state: HistoryFilterState, action: PayloadAction<number>): void => {
      state.page = action.payload;
    },
    pageSizeChanged: (state: HistoryFilterState, action: PayloadAction<PageSize>): void => {
      state.pageSize = action.payload;
      backToFirstPage(state);
    },
    sortChanged: (state: HistoryFilterState, action: PayloadAction<SortOrder>): void => {
      state.sort = action.payload;
      backToFirstPage(state);
    },
    filtersCleared: (state: HistoryFilterState): HistoryFilterState => ({
      ...INITIAL_HISTORY_FILTER,
      pageSize: state.pageSize,
      sort: state.sort,
    }),
  },
  extraReducers: (builder: ActionReducerMapBuilder<HistoryFilterState>): void => {
    builder.addMatcher(isSessionEnd, (): HistoryFilterState => INITIAL_HISTORY_FILTER);
  },
  selectors: {
    selectOrderHistoryFilter: (state: HistoryFilterState): HistoryFilterState => state,
  },
});

export const {
  searchChanged,
  searchApplied,
  statusChanged,
  fromChanged,
  toChanged,
  pageChanged,
  pageSizeChanged,
  sortChanged,
  filtersCleared,
} = orderHistoryFilterSlice.actions;

export const { selectOrderHistoryFilter } = orderHistoryFilterSlice.selectors;
