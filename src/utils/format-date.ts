import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DATE_FORMAT } from "@/constants/dates";

export function formatDate(instant: string): string {
  return format(new Date(instant), DATE_FORMAT, { locale: ptBR });
}
