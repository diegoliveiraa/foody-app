import { useParams } from "react-router";
import { EMPTY_PATH, ID_PARAM } from "@/constants/routes";

export function useIdParam(): string {
  return useParams()[ID_PARAM] ?? EMPTY_PATH;
}
