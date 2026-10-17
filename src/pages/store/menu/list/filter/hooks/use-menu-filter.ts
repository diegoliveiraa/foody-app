import { useMemo, useReducer } from "react";
import {
  categoryChosen,
  INITIAL_MENU_FILTER,
  menuFilterReducer,
  searchChanged,
  searchCleared,
} from "../index";
import type { CategoryChoice, MenuFilterActions, MenuFilterModel } from "../types";

export function useMenuFilter(): MenuFilterModel {
  const [filter, dispatch] = useReducer(menuFilterReducer, INITIAL_MENU_FILTER);
  const actions: MenuFilterActions = useMemo(
    (): MenuFilterActions => ({
      changeSearch: (search: string): void => {
        dispatch(searchChanged(search));
      },
      chooseCategory: (categoryId: CategoryChoice): void => {
        dispatch(categoryChosen(categoryId));
      },
      clearSearch: (): void => {
        dispatch(searchCleared());
      },
    }),
    [],
  );

  return { filter, actions };
}
