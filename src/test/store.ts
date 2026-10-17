import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { vi, type Mock } from "vitest";
import { createAppStore, type AppDispatch, type AppNavigate, type AppStore } from "@/store";

export interface TestStore {
  store: AppStore;
  navigate: Mock<AppNavigate>;
}

export function createTestStore(): TestStore {
  const navigate: Mock<AppNavigate> = vi.fn<AppNavigate>(async (): Promise<void> => {});
  return { store: createAppStore({ navigate }), navigate };
}

export function baseQueryApiFor(
  store: AppStore,
  dispatch: AppDispatch = store.dispatch,
): BaseQueryApi {
  return {
    signal: new AbortController().signal,
    abort: (): void => {},
    dispatch,
    getState: store.getState,
    extra: undefined,
    endpoint: "probe",
    type: "query",
  };
}
