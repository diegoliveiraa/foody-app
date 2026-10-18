import { ALL_FILTER } from "@/constants/filters";
import { MESSAGES } from "@/constants/messages";
import { ORDER_STATUS_LABELS } from "@/constants/orders";
import { ORDER_LIST_MESSAGES } from "../../constants/messages";
import type { StatusFilter } from "../filter/types";

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  [ALL_FILTER]: MESSAGES.STATUS_FILTER_LABELS.ALL,
  ...ORDER_STATUS_LABELS,
};

export const HISTORY_MESSAGES = {
  SEARCH: "Buscar por número ou cliente",
  STATUS_FILTER: "Filtrar por status",
  FROM: "De",
  TO: "Até",
  INVERTED_RANGE: "A data final não pode ser anterior à inicial",
  LIST: "Histórico de pedidos",
  COLUMNS: {
    NUMBER: "Nº",
    CUSTOMER: ORDER_LIST_MESSAGES.CUSTOMER,
    ITEMS: MESSAGES.ORDERS.ITEMS,
    TOTAL: MESSAGES.ORDERS.TOTAL,
    STATUS: MESSAGES.LIST.STATUS,
    PLACED_AT: "Data",
  },
  SORT_OPTIONS: {
    NEWEST: MESSAGES.SORT_OPTIONS.NEWEST,
    OLDEST: "Mais antigos",
    HIGHEST_TOTAL: "Maior total",
    LOWEST_TOTAL: "Menor total",
    NUMBER_DESC: "Número (maior)",
    NUMBER_ASC: "Número (menor)",
  },
  EMPTY: "Nenhum pedido encontrado",
  LOAD_FAILED: "Não foi possível carregar o histórico",
  CLEAR_FILTERS: MESSAGES.ACTIONS.CLEAR_FILTERS,
} as const;
