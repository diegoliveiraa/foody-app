import type { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/@types/auth";
import { API_PATHS, CREDENTIALS_INCLUDE, HTTP_METHODS } from "@/constants/api";
import { api, refreshAccessToken } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body: LoginRequest): FetchArgs => ({
        url: API_PATHS.LOGIN,
        method: HTTP_METHODS.POST,
        body,
        credentials: CREDENTIALS_INCLUDE,
      }),
    }),
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body: RegisterRequest): FetchArgs => ({
        url: API_PATHS.REGISTER,
        method: HTTP_METHODS.POST,
        body,
        credentials: CREDENTIALS_INCLUDE,
      }),
    }),
    refresh: build.mutation<AuthResponse, void>({
      queryFn: (_arg: void, baseQueryApi: BaseQueryApi): ReturnType<typeof refreshAccessToken> =>
        refreshAccessToken(baseQueryApi),
    }),
    logout: build.mutation<null, void>({
      query: (): FetchArgs => ({
        url: API_PATHS.LOGOUT,
        method: HTTP_METHODS.POST,
        credentials: CREDENTIALS_INCLUDE,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
