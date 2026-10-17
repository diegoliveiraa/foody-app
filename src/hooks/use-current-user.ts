import type { MeUser } from "@/@types/me";
import { useMe } from "./use-me";

export function useCurrentUser(): MeUser | undefined {
  return useMe()?.user;
}
