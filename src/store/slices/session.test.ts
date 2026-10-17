import { describe, expect, it } from "vitest";
import {
  sessionCleared,
  sessionExpired,
  sessionSlice,
  tokenReceived,
  type SessionState,
} from "./session";

const SIGNED_IN: SessionState = { accessToken: "token-1" };

describe("session slice", () => {
  it("starts signed out, with no access token in memory", () => {
    const state: SessionState = sessionSlice.reducer(undefined, { type: "init" });

    expect(state.accessToken).toBeNull();
  });

  it("keeps the access token it receives", () => {
    const state: SessionState = sessionSlice.reducer(undefined, tokenReceived("token-1"));

    expect(state.accessToken).toBe("token-1");
  });

  it("replaces the previous token when a renewed one arrives", () => {
    const state: SessionState = sessionSlice.reducer(SIGNED_IN, tokenReceived("token-2"));

    expect(state.accessToken).toBe("token-2");
  });

  it("forgets the token on logout", () => {
    const state: SessionState = sessionSlice.reducer(SIGNED_IN, sessionCleared());

    expect(state.accessToken).toBeNull();
  });

  it("forgets the token when the session expires", () => {
    const state: SessionState = sessionSlice.reducer(SIGNED_IN, sessionExpired());

    expect(state.accessToken).toBeNull();
  });
});
