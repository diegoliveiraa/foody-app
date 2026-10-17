import type {
  FetchArgs,
  InfiniteData,
  TagDescription,
  TypedMutationOnQueryStarted,
} from "@reduxjs/toolkit/query";
import type {
  CancelOrderArgs,
  CustomerOrder,
  CustomerOrderPage,
  CustomerOrderSummary,
  ListMyOrdersParams,
  OrderId,
  OrderPath,
  PlaceOrderRequest,
} from "@/@types/orders";
import type { ApiError } from "@/@types/problem-details";
import { API_PATHS, ERROR_CODES, HTTP_METHODS, MY_ORDER_PATHS } from "@/constants/api";
import { ORDER_SORT_PROPERTIES } from "@/constants/orders";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { extractApiError } from "@/utils/api-error";
import { toSortParam } from "@/utils/sort-param";
import { api, baseQuery } from "./api";
import { CACHE_TAGS, LIST_ID, orderWriteTags, type CacheTag } from "./cache-tags";

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

const myOrderQueriesApi = api.injectEndpoints({
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

const writeCustomerOrder: TypedMutationOnQueryStarted<
  CustomerOrder,
  OrderPath,
  typeof baseQuery
> = async ({ id }: OrderPath, { dispatch, queryFulfilled }): Promise<void> => {
  try {
    const { data } = await queryFulfilled;
    await dispatch(myOrderQueriesApi.util.upsertQueryData("getMyOrder", id, data));
  } catch {
    return;
  }
};

function writeTags(
  _order: CustomerOrder | undefined,
  error: unknown,
  { id }: OrderPath,
): OrderTag[] {
  return orderWriteTags(id, error);
}

function postTo(url: string, body: object): FetchArgs {
  return { url, method: HTTP_METHODS.POST, body };
}

export const myOrdersApi = myOrderQueriesApi.injectEndpoints({
  endpoints: (build) => ({
    cancelMyOrder: build.mutation<CustomerOrder, CancelOrderArgs>({
      query: ({ id, ...body }: CancelOrderArgs): FetchArgs =>
        postTo(MY_ORDER_PATHS.CANCEL(id), body),
      onQueryStarted: writeCustomerOrder,
      invalidatesTags: writeTags,
    }),
    requestCancellation: build.mutation<CustomerOrder, CancelOrderArgs>({
      query: ({ id, ...body }: CancelOrderArgs): FetchArgs =>
        postTo(MY_ORDER_PATHS.REQUEST_CANCELLATION(id), body),
      onQueryStarted: writeCustomerOrder,
      invalidatesTags: writeTags,
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useListMyOrdersInfiniteQuery,
  useGetMyOrderQuery,
  useCancelMyOrderMutation,
  useRequestCancellationMutation,
} = myOrdersApi;
