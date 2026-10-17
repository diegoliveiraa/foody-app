import type { CatalogStatus } from "@/@types/catalog";
import { CATALOG_STATUSES } from "@/constants/catalog";
import { MESSAGES } from "@/constants/messages";
import type { ProductCountKind } from "../types";
import { PRODUCT_COUNT_KINDS } from "./index";

const NEW_CATEGORY: string = "Nova categoria";

const DISPLAY_ORDER: string = "Ordem";

const PRODUCTS: string = "Produtos";

export const CATEGORY_STATUS_LABELS: Record<CatalogStatus, string> = {
  [CATALOG_STATUSES.ACTIVE]: "Ativa",
  [CATALOG_STATUSES.DISABLED]: "Desabilitada",
};

const DISABLE_DESCRIPTIONS: Record<ProductCountKind, (count: number) => string> = {
  [PRODUCT_COUNT_KINDS.NONE]: (): string =>
    "A categoria fica fora do cardápio até ser habilitada de novo.",
  [PRODUCT_COUNT_KINDS.ONE]: (count: number): string =>
    `${count} produto desta categoria some do cardápio.`,
  [PRODUCT_COUNT_KINDS.MANY]: (count: number): string =>
    `Os ${count} produtos desta categoria somem do cardápio.`,
};

export const CATEGORIES_MESSAGES = {
  LIST: "Lista de categorias",
  COLUMNS: {
    DISPLAY_ORDER,
    PRODUCTS,
    STATUS: MESSAGES.LIST.STATUS,
    ACTIONS: MESSAGES.LIST.ACTIONS,
  },
  DISPLAY_ORDER_OF: (order: number): string => `${DISPLAY_ORDER} ${order}`,
  PRODUCT_COUNT: (count: number): string => `${PRODUCTS}: ${count}`,
  EMPTY: "Nenhuma categoria cadastrada",
  LOAD_FAILED: "Não foi possível carregar as categorias",
  NEW: NEW_CATEGORY,
  FORM: {
    CREATE_TITLE: NEW_CATEGORY,
    EDIT_TITLE: MESSAGES.DIALOGS.EDIT_TITLE,
    DESCRIPTION: "O cardápio mostra as categorias da menor para a maior ordem.",
    NAME: MESSAGES.FIELDS.NAME,
    DISPLAY_ORDER: "Ordem de exibição",
    CREATE: "Criar categoria",
    SAVE: MESSAGES.ACTIONS.SAVE,
    CANCEL: MESSAGES.ACTIONS.CANCEL,
  },
  EDIT: MESSAGES.ACTIONS.EDIT,
  DISABLE: MESSAGES.ACTIONS.DISABLE,
  ENABLE: MESSAGES.ACTIONS.ENABLE,
  DELETE: MESSAGES.ACTIONS.DELETE,
  DISABLE_INSTEAD: MESSAGES.ACTIONS.DISABLE_INSTEAD,
  DISABLE_DIALOG: {
    TITLE: MESSAGES.DIALOGS.DISABLE_TITLE,
    DESCRIPTIONS: DISABLE_DESCRIPTIONS,
    CONFIRM: MESSAGES.ACTIONS.DISABLE,
  },
  DELETE_DIALOG: {
    TITLE: MESSAGES.DIALOGS.DELETE_TITLE,
    DESCRIPTION: MESSAGES.DIALOGS.CANNOT_UNDO,
    CONFIRM: MESSAGES.ACTIONS.DELETE,
  },
  CREATED: (name: string): string => `Categoria criada: ${name}`,
  UPDATED: (name: string): string => `Categoria atualizada: ${name}`,
  DISABLED: (name: string): string => `Categoria desabilitada: ${name}`,
  ENABLED: (name: string): string => `Categoria habilitada: ${name}`,
  DELETED: (name: string): string => `Categoria excluída: ${name}`,
} as const;
