import type { FetchArgs } from "@reduxjs/toolkit/query";
import type { CartQuote, MenuResponse, QuoteRequest } from "@/@types/menu";
import { API_PATHS, HTTP_METHODS } from "@/constants/api";
import { api } from "./api";
import { CACHE_TAGS, type CacheTag } from "./cache-tags";

export const menuApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query<MenuResponse, void>({
      query: (): string => API_PATHS.MENU,
      providesTags: (): CacheTag[] => [CACHE_TAGS.MENU],
    }),
    quoteCart: build.query<CartQuote, QuoteRequest>({
      query: (body: QuoteRequest): FetchArgs => ({
        url: API_PATHS.MENU_QUOTE,
        method: HTTP_METHODS.POST,
        body,
      }),
      providesTags: (): CacheTag[] => [CACHE_TAGS.MENU],
    }),
  }),
});

export const { useGetMenuQuery, useQuoteCartQuery } = menuApi;
