import { createSlice, type PayloadAction, type Reducer } from "@reduxjs/toolkit";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, type PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";
import { DEFAULT_HISTORY_SORT, HISTORY_FILTER_NAME, NO_DATE } from "../constants";
import type { HistoryFilterState, StatusFilter } from "./types";

export const INITIAL_HISTORY_FILTER: HistoryFilterState = {
  search: EMPTY_SEARCH,
  appliedSearch: EMPTY_SEARCH,
  status: ALL_FILTER,
  from: NO_DATE,
  to: NO_DATE,
  page: FIRST_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_HISTORY_SORT,
};

function backToFirstPage(state: HistoryFilterState): void {
  state.page = FIRST_PAGE;
}

const historyFilterSlice = createSlice({
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
      backToFirstPage(state);
    },
    toChanged: (state: HistoryFilterState, action: PayloadAction<string>): void => {
      state.to = action.payload;
      backToFirstPage(state);
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
});

export const historyFilterReducer: Reducer<HistoryFilterState> = historyFilterSlice.reducer;

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
} = historyFilterSlice.actions;
