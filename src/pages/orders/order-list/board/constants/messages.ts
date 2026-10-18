import { ORDER_STATUSES, type BoardStatus } from "@/constants/orders";

const ONE_REQUEST: number = 1;

export const EMPTY_COLUMN_MESSAGES: Record<BoardStatus, string> = {
  [ORDER_STATUSES.RECEIVED]: "Nenhum pedido novo",
  [ORDER_STATUSES.PREPARING]: "Nenhum pedido em preparo",
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "Nenhum pedido saindo para entrega",
};

export const BOARD_MESSAGES = {
  RELOAD_LABEL: "Recarregar pedidos",
  BY_STATUS: "Pedidos por status",
  LOADING: "Carregando pedidos",
  LOAD_FAILED: "Não foi possível carregar os pedidos",
  ORDERS_IN: (column: string): string => `Pedidos: ${column}`,
  PENDING_REQUESTS: (count: number): string =>
    count === ONE_REQUEST
      ? `${count} solicitação de cancelamento aguardando você`
      : `${count} solicitações de cancelamento aguardando você`,
} as const;
