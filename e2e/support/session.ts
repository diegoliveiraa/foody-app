import type { AuthResponse } from "../../src/@types/auth";
import type { MeResponse } from "../../src/@types/me";
import { API_PATHS, HTTP_STATUS } from "../../src/constants/api";
import {
  ACCESS_TOKEN_LIFETIME_SECONDS,
  E2E_ACCESS_TOKEN,
  HTTP_METHODS,
  HTTP_NO_CONTENT,
} from "./constants";
import type { ApiStubs } from "./fixtures";
import { problem } from "./problems";

export const SIGNED_IN: AuthResponse = {
  accessToken: E2E_ACCESS_TOKEN,
  expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
};

export async function stubMe(api: ApiStubs, me: MeResponse): Promise<void> {
  await api.respond(HTTP_METHODS.GET, API_PATHS.ME, me);
}

export async function stubSession(api: ApiStubs, me: MeResponse): Promise<void> {
  await api.respond(HTTP_METHODS.POST, API_PATHS.REFRESH, SIGNED_IN);
  await stubMe(api, me);
}

export async function stubSignedOut(api: ApiStubs): Promise<void> {
  await api.respond(
    HTTP_METHODS.POST,
    API_PATHS.REFRESH,
    problem(HTTP_STATUS.UNAUTHORIZED, "REFRESH_TOKEN_INVALID", "Sessão inválida."),
    HTTP_STATUS.UNAUTHORIZED,
  );
}

export async function stubLogout(api: ApiStubs): Promise<void> {
  await api.respond(HTTP_METHODS.POST, API_PATHS.LOGOUT, null, HTTP_NO_CONTENT);
}
