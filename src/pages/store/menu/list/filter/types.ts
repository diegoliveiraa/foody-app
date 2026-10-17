import type { MenuCategory } from "@/@types/menu";

export type CategoryChoice = MenuCategory["id"];

export interface MenuFilterState {
  search: string;
  categoryId: CategoryChoice;
}

export interface MenuFilterActions {
  changeSearch: (search: string) => void;
  chooseCategory: (categoryId: CategoryChoice) => void;
  clearSearch: () => void;
}

export interface MenuFilterModel {
  filter: MenuFilterState;
  actions: MenuFilterActions;
}
