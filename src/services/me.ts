import type { MeResponse } from "@/@types/me";
import { API_PATHS } from "@/constants/api";
import { api } from "./api";
import { CACHE_TAGS, type CacheTag } from "./cache-tags";

export const meApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<MeResponse, void>({
      query: (): string => API_PATHS.ME,
      providesTags: (): CacheTag[] => [CACHE_TAGS.ME],
    }),
  }),
});

export const { useGetMeQuery } = meApi;
