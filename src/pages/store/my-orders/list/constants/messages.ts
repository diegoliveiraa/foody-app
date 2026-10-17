import type { CancellationRequestStatus } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { CANCELLATION_REQUEST_STATUSES } from "@/constants/orders";

export const MY_ORDERS_MESSAGES = {
  LIST: "Seus pedidos",
  LOADING: "Carregando seus pedidos",
  EMPTY: "Você ainda não fez pedidos",
  EMPTY_DESCRIPTION: "Escolha seus pratos no cardápio e acompanhe o pedido por aqui.",
  BROWSE_MENU: MESSAGES.BROWSE_MENU,
  LOAD_FAILED: "Não foi possível carregar seus pedidos",
  LOAD_MORE: "Ver mais pedidos",
  REQUEST_PENDING: "Solicitação enviada. Avisaremos a resposta.",
} as const;

export const REQUEST_NOTES: Record<CancellationRequestStatus, string | null> = {
  [CANCELLATION_REQUEST_STATUSES.PENDING]: MY_ORDERS_MESSAGES.REQUEST_PENDING,
  [CANCELLATION_REQUEST_STATUSES.DECLINED]: MESSAGES.ORDERS.CANCELLATION_DECLINED,
  [CANCELLATION_REQUEST_STATUSES.APPROVED]: null,
};
