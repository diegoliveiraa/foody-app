import type { CatalogStatus } from "@/@types/catalog";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { ALL_FILTER } from "@/constants/filters";
import { MESSAGES } from "@/constants/messages";
import type { StatusFilter } from "../filter/types";

const CATEGORY: string = "Categoria";

const NEW_PRODUCT: string = "Novo produto";

export const PRODUCT_STATUS_LABELS: Record<CatalogStatus, string> = {
  [CATALOG_STATUSES.ACTIVE]: MESSAGES.STATUS_LABELS.ACTIVE,
  [CATALOG_STATUSES.DISABLED]: MESSAGES.STATUS_LABELS.DISABLED,
};

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  [ALL_FILTER]: MESSAGES.STATUS_FILTER_LABELS.ALL,
  [CATALOG_STATUSES.ACTIVE]: MESSAGES.STATUS_FILTER_LABELS.ACTIVE,
  [CATALOG_STATUSES.DISABLED]: MESSAGES.STATUS_FILTER_LABELS.DISABLED,
};

export const PRODUCTS_MESSAGES = {
  SEARCH: "Buscar produto por nome",
  CATEGORY_FILTER: "Filtrar por categoria",
  ALL_CATEGORIES: "Todas as categorias",
  STATUS_FILTER: "Filtrar por status",
  LIST: "Lista de produtos",
  COLUMNS: {
    CATEGORY,
    PRICE: "Preço",
    STATUS: MESSAGES.LIST.STATUS,
    CREATED_AT: MESSAGES.LIST.CREATED_AT,
    ACTIONS: MESSAGES.LIST.ACTIONS,
  },
  CREATED_AT: MESSAGES.LIST.CREATED_ON,
  SORT_OPTIONS: {
    NAME_ASC: MESSAGES.SORT_OPTIONS.NAME_ASC,
    NAME_DESC: MESSAGES.SORT_OPTIONS.NAME_DESC,
    LOWEST_PRICE: "Menor preço",
    HIGHEST_PRICE: "Maior preço",
    NEWEST: MESSAGES.SORT_OPTIONS.NEWEST,
  },
  EMPTY: "Nenhum produto encontrado",
  LOAD_FAILED: "Não foi possível carregar os produtos",
  NEW: NEW_PRODUCT,
  FORM: {
    CREATE_TITLE: NEW_PRODUCT,
    EDIT_TITLE: MESSAGES.DIALOGS.EDIT_TITLE,
    DESCRIPTION: "O cliente vê o nome, a descrição e o preço no cardápio.",
    NAME: MESSAGES.FIELDS.NAME,
    DETAILS: "Descrição (opcional)",
    PRICE: "Preço (R$)",
    PRICE_PLACEHOLDER: "34,90",
    CATEGORY,
    CHOOSE_CATEGORY: "Selecione",
    DISABLED_CATEGORY: (name: string): string => `${name} (categoria desabilitada)`,
    CREATE: "Criar produto",
    SAVE: MESSAGES.ACTIONS.SAVE,
    CANCEL: MESSAGES.ACTIONS.CANCEL,
  },
  EDIT: MESSAGES.ACTIONS.EDIT,
  DISABLE: MESSAGES.ACTIONS.DISABLE,
  ENABLE: MESSAGES.ACTIONS.ENABLE,
  DELETE: MESSAGES.ACTIONS.DELETE,
  DISABLE_INSTEAD: MESSAGES.ACTIONS.DISABLE_INSTEAD,
  CLEAR_FILTERS: MESSAGES.ACTIONS.CLEAR_FILTERS,
  DISABLE_DIALOG: {
    TITLE: MESSAGES.DIALOGS.DISABLE_TITLE,
    DESCRIPTION: (name: string): string =>
      `${name} some do cardápio até você habilitar o produto de novo.`,
    CONFIRM: MESSAGES.ACTIONS.DISABLE,
  },
  DELETE_DIALOG: {
    TITLE: MESSAGES.DIALOGS.DELETE_TITLE,
    DESCRIPTION: MESSAGES.DIALOGS.CANNOT_UNDO,
    CONFIRM: MESSAGES.ACTIONS.DELETE,
  },
  CREATED: (name: string): string => `Produto criado: ${name}`,
  UPDATED: (name: string): string => `Produto atualizado: ${name}`,
  DISABLED: (name: string): string => `Produto desabilitado: ${name}`,
  ENABLED: (name: string): string => `Produto habilitado: ${name}`,
  DELETED: (name: string): string => `Produto excluído: ${name}`,
} as const;
