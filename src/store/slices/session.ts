import { createAction, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SessionState {
  accessToken: string | null;
}

const initialState: SessionState = { accessToken: null };

function forgetToken(state: SessionState): void {
  state.accessToken = null;
}

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    tokenReceived: (state: SessionState, action: PayloadAction<string>): void => {
      state.accessToken = action.payload;
    },
    sessionCleared: forgetToken,
    sessionExpired: forgetToken,
  },
  selectors: {
    selectAccessToken: (state: SessionState): string | null => state.accessToken,
  },
});

export const { tokenReceived, sessionCleared, sessionExpired } = sessionSlice.actions;

export const { selectAccessToken } = sessionSlice.selectors;

export const logoutRequested = createAction("session/logoutRequested");
