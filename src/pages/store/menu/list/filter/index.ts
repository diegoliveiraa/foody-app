import { createSlice, type PayloadAction, type Reducer } from "@reduxjs/toolkit";
import { ALL_FILTER, EMPTY_SEARCH } from "@/constants/filters";
import { MENU_FILTER_NAME } from "../constants";
import type { CategoryChoice, MenuFilterState } from "./types";

export const INITIAL_MENU_FILTER: MenuFilterState = {
  search: EMPTY_SEARCH,
  categoryId: ALL_FILTER,
};

const menuFilterSlice = createSlice({
  name: MENU_FILTER_NAME,
  initialState: INITIAL_MENU_FILTER,
  reducers: {
    searchChanged: (state: MenuFilterState, action: PayloadAction<string>): void => {
      state.search = action.payload;
    },
    categoryChosen: (state: MenuFilterState, action: PayloadAction<CategoryChoice>): void => {
      state.categoryId = action.payload;
    },
    searchCleared: (state: MenuFilterState): void => {
      state.search = EMPTY_SEARCH;
    },
  },
});

export const menuFilterReducer: Reducer<MenuFilterState> = menuFilterSlice.reducer;

export const { searchChanged, categoryChosen, searchCleared } = menuFilterSlice.actions;
