import { useCallback } from "react";
import type { AppDispatch } from "@/store";
import { logoutRequested } from "@/store/slices/session";
import { useAppDispatch } from "./use-app-dispatch";

export function useLogout(): () => void {
  const dispatch: AppDispatch = useAppDispatch();
  return useCallback((): void => {
    dispatch(logoutRequested());
  }, [dispatch]);
}
