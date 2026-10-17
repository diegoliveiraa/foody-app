import { isAnyOf, type UnknownAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import type { AuthResponse } from "@/@types/auth";
import { MESSAGES } from "@/constants/messages";
import { ROUTE_PATHS } from "@/constants/routes";
import { TOAST_IDS } from "@/constants/toasts";
import { api } from "@/services/api";
import { authApi } from "@/services/auth";
import type { AppDispatch, AppStartListening, StoreDependencies } from "@/store";
import {
  logoutRequested,
  sessionCleared,
  sessionExpired,
  tokenReceived,
} from "@/store/slices/session";

interface SessionListenerApi {
  dispatch: AppDispatch;
  extra: StoreDependencies;
}

const isSessionStart = isAnyOf(
  authApi.endpoints.login.matchFulfilled,
  authApi.endpoints.register.matchFulfilled,
);

async function leaveForLogin({ dispatch, extra }: SessionListenerApi): Promise<void> {
  await extra.navigate(ROUTE_PATHS.LOGIN);
  dispatch(api.util.resetApiState());
}

export function listenForSessionChanges(startListening: AppStartListening): void {
  startListening({
    matcher: isSessionStart,
    effect: (action: { payload: AuthResponse }, { dispatch }: SessionListenerApi): void => {
      dispatch(tokenReceived(action.payload.accessToken));
    },
  });
  startListening({
    actionCreator: logoutRequested,
    effect: async (_action: UnknownAction, listenerApi: SessionListenerApi): Promise<void> => {
      await listenerApi.dispatch(authApi.endpoints.logout.initiate());
      listenerApi.dispatch(sessionCleared());
      await leaveForLogin(listenerApi);
    },
  });
  startListening({
    actionCreator: sessionExpired,
    effect: async (_action: UnknownAction, listenerApi: SessionListenerApi): Promise<void> => {
      toast(MESSAGES.SESSION.EXPIRED, { id: TOAST_IDS.SESSION_EXPIRED });
      await leaveForLogin(listenerApi);
    },
  });
}
