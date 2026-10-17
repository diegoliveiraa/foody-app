import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  type EnhancedStore,
  type ThunkDispatch,
  type TypedStartListening,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/services/api";
import { listenForCartChanges } from "./listeners/cart";
import { listenForRateLimits } from "./listeners/rate-limit";
import { listenForSessionChanges } from "./listeners/session";
import { cartSlice } from "./slices/cart";
import { sessionSlice } from "./slices/session";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [sessionSlice.reducerPath]: sessionSlice.reducer,
  [cartSlice.reducerPath]: cartSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

export type AppNavigate = (to: string) => Promise<void>;

export interface StoreDependencies {
  navigate: AppNavigate;
}

export type AppStartListening = TypedStartListening<RootState, AppDispatch, StoreDependencies>;

export type AppStore = Omit<EnhancedStore<RootState>, "dispatch"> & { dispatch: AppDispatch };

export function createAppStore(dependencies: StoreDependencies): AppStore {
  const listener = createListenerMiddleware<RootState, AppDispatch, StoreDependencies>({
    extra: dependencies,
  });
  const store: AppStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listener.middleware).concat(api.middleware),
  });
  setupListeners(store.dispatch);
  listenForRateLimits(listener.startListening);
  listenForSessionChanges(listener.startListening);
  listenForCartChanges(listener.startListening);
  return store;
}
