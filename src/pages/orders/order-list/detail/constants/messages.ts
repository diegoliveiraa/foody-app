import { MESSAGES } from "@/constants/messages";
import { ORDER_LIST_MESSAGES } from "../../constants/messages";

const ONE_UNIT: number = 1;

export const ORDER_DETAIL_MESSAGES = {
  TITLE: (number: number, customer: string): string =>
    `${MESSAGES.ORDERS.NUMBER(number)} · ${customer}`,
  PLACED: (when: string, units: string): string => `${when} · ${units}`,
  UNITS: (units: number): string => (units === ONE_UNIT ? `${units} item` : `${units} itens`),
  CUSTOMER: ORDER_LIST_MESSAGES.CUSTOMER,
  HISTORY: ORDER_LIST_MESSAGES.HISTORY,
  CREATED: "Pedido criado",
  STATUS_CHANGE: (from: string, to: string): string => `${from} → ${to}`,
  ACTOR: (time: string, name: string, side: string): string => `${time} · ${name} (${side})`,
  REASON: MESSAGES.ORDERS.REASON,
  BACK: "Voltar para pedidos",
} as const;
