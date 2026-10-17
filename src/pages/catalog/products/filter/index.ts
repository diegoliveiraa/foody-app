import { createSlice, type PayloadAction, type Reducer } from "@reduxjs/toolkit";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, type PageSize } from "@/constants/pagination";
import type { SortOrder } from "@/utils/sort-param";
import { DEFAULT_PRODUCT_SORT, PRODUCTS_FILTER_NAME } from "../constants";
import type { CategoryFilter, ProductsFilterState, StatusFilter } from "./types";

export const INITIAL_PRODUCTS_FILTER: ProductsFilterState = {
  search: EMPTY_SEARCH,
  appliedSearch: EMPTY_SEARCH,
  categoryId: ALL_FILTER,
  status: ALL_FILTER,
  page: FIRST_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_PRODUCT_SORT,
};

function backToFirstPage(state: ProductsFilterState): void {
  state.page = FIRST_PAGE;
}

const productsFilterSlice = createSlice({
  name: PRODUCTS_FILTER_NAME,
  initialState: INITIAL_PRODUCTS_FILTER,
  reducers: {
    searchChanged: (state: ProductsFilterState, action: PayloadAction<string>): void => {
      state.search = action.payload;
    },
    searchApplied: (state: ProductsFilterState, action: PayloadAction<string>): void => {
      state.appliedSearch = action.payload;
      backToFirstPage(state);
    },
    categoryChanged: (state: ProductsFilterState, action: PayloadAction<CategoryFilter>): void => {
      state.categoryId = action.payload;
      backToFirstPage(state);
    },
    statusChanged: (state: ProductsFilterState, action: PayloadAction<StatusFilter>): void => {
      state.status = action.payload;
      backToFirstPage(state);
    },
    pageChanged: (state: ProductsFilterState, action: PayloadAction<number>): void => {
      state.page = action.payload;
    },
    pageSizeChanged: (state: ProductsFilterState, action: PayloadAction<PageSize>): void => {
      state.pageSize = action.payload;
      backToFirstPage(state);
    },
    sortChanged: (state: ProductsFilterState, action: PayloadAction<SortOrder>): void => {
      state.sort = action.payload;
      backToFirstPage(state);
    },
    filtersCleared: (state: ProductsFilterState): ProductsFilterState => ({
      ...INITIAL_PRODUCTS_FILTER,
      pageSize: state.pageSize,
      sort: state.sort,
    }),
  },
});

export const productsFilterReducer: Reducer<ProductsFilterState> = productsFilterSlice.reducer;

export const {
  searchChanged,
  searchApplied,
  categoryChanged,
  statusChanged,
  pageChanged,
  pageSizeChanged,
  sortChanged,
  filtersCleared,
} = productsFilterSlice.actions;
