import type { OrderStatus } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { ORDER_STATUSES } from "@/constants/orders";
import type { SheetCopy, SheetMode } from "../types";
import { SHEET_MODES } from "./index";

const REQUEST_CANCELLATION: string = "Solicitar cancelamento";

export const STEP_HINTS: Partial<Record<OrderStatus, string>> = {
  [ORDER_STATUSES.RECEIVED]: "o restaurante recebeu seu pedido",
  [ORDER_STATUSES.PREPARING]: "a cozinha já começou",
};

export const TRACKING_MESSAGES = {
  BACK: "Voltar para meus pedidos",
  STATUS: "Status do pedido",
  STATUS_NOW: "Status agora",
  LIVE: "Atualiza sozinho",
  TIMELINE: "Andamento do pedido",
  STEP_SEPARATOR: " · ",
  BACK_TO_LIST: "Ver meus pedidos",
  CANCELLATION: "Cancelamento",
  REQUEST_PENDING: "Solicitação de cancelamento enviada. Avisaremos a resposta.",
  REQUEST_DECLINED: MESSAGES.ORDERS.CANCELLATION_DECLINED,
  REASON_LEGEND: "Por que você quer cancelar?",
  KEEP_ORDER: "Manter pedido",
  REQUEST_EXPLANATION:
    "Seu pedido já está em preparo. O restaurante vai analisar e você recebe a resposta aqui.",
} as const;

export const SHEET_COPY: Record<SheetMode, SheetCopy> = {
  [SHEET_MODES.CANCEL]: {
    intro: "O restaurante ainda não começou o seu pedido. Você pode cancelar agora.",
    open: MESSAGES.CANCELLATION.CANCEL_ORDER,
    title: MESSAGES.CANCELLATION.CANCEL_ORDER,
    explanation: null,
    submit: MESSAGES.CANCELLATION.CANCEL_ORDER,
    done: MESSAGES.ORDERS.CANCELLED,
  },
  [SHEET_MODES.REQUEST]: {
    intro:
      "A cozinha já começou o seu pedido. Você pode pedir o cancelamento, e o restaurante decide.",
    open: REQUEST_CANCELLATION,
    title: REQUEST_CANCELLATION,
    explanation: TRACKING_MESSAGES.REQUEST_EXPLANATION,
    submit: "Enviar solicitação",
    done: (): string => "Solicitação enviada ao restaurante",
  },
};
