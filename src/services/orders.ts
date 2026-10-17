import type { FetchArgs, TagDescription } from "@reduxjs/toolkit/query";
import type {
  ListOrdersParams,
  OrderId,
  StaffOrder,
  StaffOrderPage,
  StaffOrderSummary,
} from "@/@types/orders";
import { API_PATHS, ORDER_PATHS } from "@/constants/api";
import { BOARD_PAGE_SIZE, BOARD_STATUSES, ORDER_SORT_PROPERTIES } from "@/constants/orders";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { toSortParam } from "@/utils/sort-param";
import { api } from "./api";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "./cache-tags";

type OrderTag = TagDescription<CacheTag>;

const ORDER_LIST_TAG: OrderTag = { type: CACHE_TAGS.ORDER, id: LIST_ID };

const BOARD_PARAMS: ListOrdersParams = {
  status: [...BOARD_STATUSES],
  pageSize: BOARD_PAGE_SIZE,
  sort: [
    toSortParam({ property: ORDER_SORT_PROPERTIES.PLACED_AT, direction: SORT_DIRECTIONS.ASC }),
  ],
};

function pageTags(page: StaffOrderPage | undefined): OrderTag[] {
  return [
    ORDER_LIST_TAG,
    ...(page?.data ?? []).map((order: StaffOrderSummary): OrderTag => ({
      type: CACHE_TAGS.ORDER,
      id: order.id,
    })),
  ];
}

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrderBoard: build.query<StaffOrderPage, void>({
      query: (): FetchArgs => ({ url: API_PATHS.ORDERS, params: BOARD_PARAMS }),
      providesTags: pageTags,
    }),
    listOrders: build.query<StaffOrderPage, ListOrdersParams>({
      query: (params: ListOrdersParams): FetchArgs => ({ url: API_PATHS.ORDERS, params }),
      providesTags: pageTags,
    }),
    getOrder: build.query<StaffOrder, OrderId>({
      query: (id: OrderId): string => ORDER_PATHS.ONE(id),
      providesTags: (_order, _error, id: OrderId): OrderTag[] => [{ type: CACHE_TAGS.ORDER, id }],
    }),
  }),
});

export const { useGetOrderBoardQuery, useListOrdersQuery, useGetOrderQuery } = ordersApi;
