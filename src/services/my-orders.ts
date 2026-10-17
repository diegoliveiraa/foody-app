import type { FetchArgs, InfiniteData, TagDescription } from "@reduxjs/toolkit/query";
import type {
  CustomerOrder,
  CustomerOrderPage,
  CustomerOrderSummary,
  ListMyOrdersParams,
  OrderId,
  PlaceOrderRequest,
} from "@/@types/orders";
import type { ApiError } from "@/@types/problem-details";
import { API_PATHS, ERROR_CODES, HTTP_METHODS, MY_ORDER_PATHS } from "@/constants/api";
import { ORDER_SORT_PROPERTIES } from "@/constants/orders";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { extractApiError } from "@/utils/api-error";
import { toSortParam } from "@/utils/sort-param";
import { api } from "./api";
import { CACHE_TAGS, LIST_ID, type CacheTag } from "./cache-tags";

type OrderTag = TagDescription<CacheTag>;

type MyOrdersData = InfiniteData<CustomerOrderPage, number>;

const ORDER_LIST_TAG: OrderTag = { type: CACHE_TAGS.ORDER, id: LIST_ID };

const MENU_TAG: OrderTag = CACHE_TAGS.MENU;

const NEXT_PAGE_STEP: number = 1;

const NEWEST_FIRST: string = toSortParam({
  property: ORDER_SORT_PROPERTIES.PLACED_AT,
  direction: SORT_DIRECTIONS.DESC,
});

function myOrdersParams(page: number): ListMyOrdersParams {
  return { page, pageSize: DEFAULT_PAGE_SIZE, sort: [NEWEST_FIRST] };
}

function placeOrderTags(error: ApiError | undefined): OrderTag[] {
  if (error === undefined) {
    return [ORDER_LIST_TAG];
  }
  return extractApiError(error).code === ERROR_CODES.PRODUCT_UNAVAILABLE ? [MENU_TAG] : [];
}

function nextPageOf({ meta }: CustomerOrderPage): number | undefined {
  return meta.hasNext ? meta.page + NEXT_PAGE_STEP : undefined;
}

function orderTagsOf(data: MyOrdersData | undefined): OrderTag[] {
  return (data?.pages ?? []).flatMap((page: CustomerOrderPage): OrderTag[] =>
    page.data.map((order: CustomerOrderSummary): OrderTag => ({
      type: CACHE_TAGS.ORDER,
      id: order.id,
    })),
  );
}

export const myOrdersApi = api.injectEndpoints({
  endpoints: (build) => ({
    placeOrder: build.mutation<CustomerOrder, PlaceOrderRequest>({
      query: (body: PlaceOrderRequest): FetchArgs => ({
        url: API_PATHS.MY_ORDERS,
        method: HTTP_METHODS.POST,
        body,
      }),
      invalidatesTags: (_order, error: ApiError | undefined): OrderTag[] => placeOrderTags(error),
    }),
    listMyOrders: build.infiniteQuery<CustomerOrderPage, void, number>({
      infiniteQueryOptions: {
        initialPageParam: FIRST_PAGE,
        getNextPageParam: nextPageOf,
      },
      query: ({ pageParam }: { pageParam: number }): FetchArgs => ({
        url: API_PATHS.MY_ORDERS,
        params: myOrdersParams(pageParam),
      }),
      providesTags: (data: MyOrdersData | undefined): OrderTag[] => [
        ORDER_LIST_TAG,
        ...orderTagsOf(data),
      ],
    }),
    getMyOrder: build.query<CustomerOrder, OrderId>({
      query: (id: OrderId): string => MY_ORDER_PATHS.ONE(id),
      providesTags: (_order, _error, id: OrderId): OrderTag[] => [{ type: CACHE_TAGS.ORDER, id }],
    }),
  }),
});

export const { usePlaceOrderMutation, useListMyOrdersInfiniteQuery, useGetMyOrderQuery } =
  myOrdersApi;
