import type { TagDescription } from "@reduxjs/toolkit/query";
import { useCallback } from "react";
import { api } from "@/services/api";
import type { CacheTag } from "@/services/cache-tags";
import type { AppDispatch } from "@/store";
import { useAppDispatch } from "./use-app-dispatch";

export function useReload(tags: readonly TagDescription<CacheTag>[]): () => void {
  const dispatch: AppDispatch = useAppDispatch();
  return useCallback((): void => {
    dispatch(api.util.invalidateTags([...tags]));
  }, [dispatch, tags]);
}
