import { createSlice, type PayloadAction, type Reducer } from "@reduxjs/toolkit";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, type PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";
import { DEFAULT_USER_SORT, USERS_FILTER_NAME } from "../constants";
import type { RoleFilter, StatusFilter, UsersFilterState } from "./types";

export const INITIAL_USERS_FILTER: UsersFilterState = {
  search: EMPTY_SEARCH,
  appliedSearch: EMPTY_SEARCH,
  role: ALL_FILTER,
  status: ALL_FILTER,
  page: FIRST_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_USER_SORT,
};

function backToFirstPage(state: UsersFilterState): void {
  state.page = FIRST_PAGE;
}

const usersFilterSlice = createSlice({
  name: USERS_FILTER_NAME,
  initialState: INITIAL_USERS_FILTER,
  reducers: {
    searchChanged: (state: UsersFilterState, action: PayloadAction<string>): void => {
      state.search = action.payload;
    },
    searchApplied: (state: UsersFilterState, action: PayloadAction<string>): void => {
      state.appliedSearch = action.payload;
      backToFirstPage(state);
    },
    roleChanged: (state: UsersFilterState, action: PayloadAction<RoleFilter>): void => {
      state.role = action.payload;
      backToFirstPage(state);
    },
    statusChanged: (state: UsersFilterState, action: PayloadAction<StatusFilter>): void => {
      state.status = action.payload;
      backToFirstPage(state);
    },
    pageChanged: (state: UsersFilterState, action: PayloadAction<number>): void => {
      state.page = action.payload;
    },
    pageSizeChanged: (state: UsersFilterState, action: PayloadAction<PageSize>): void => {
      state.pageSize = action.payload;
      backToFirstPage(state);
    },
    sortChanged: (state: UsersFilterState, action: PayloadAction<SortOrder>): void => {
      state.sort = action.payload;
      backToFirstPage(state);
    },
    filtersCleared: (state: UsersFilterState): UsersFilterState => ({
      ...INITIAL_USERS_FILTER,
      pageSize: state.pageSize,
      sort: state.sort,
    }),
  },
});

export const usersFilterReducer: Reducer<UsersFilterState> = usersFilterSlice.reducer;

export const {
  searchChanged,
  searchApplied,
  roleChanged,
  statusChanged,
  pageChanged,
  pageSizeChanged,
  sortChanged,
  filtersCleared,
} = usersFilterSlice.actions;
