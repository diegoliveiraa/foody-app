import type {
  FetchArgs,
  TagDescription,
  TypedMutationOnQueryStarted,
} from "@reduxjs/toolkit/query";
import type {
  CancelOrderArgs,
  DecideCancellationArgs,
  ListOrdersParams,
  OrderId,
  OrderPath,
  StaffOrder,
  StaffOrderPage,
  StaffOrderSummary,
  UpdateOrderStatusArgs,
} from "@/@types/orders";
import { API_PATHS, HTTP_METHODS, ORDER_PATHS } from "@/constants/api";
import { BOARD_PAGE_SIZE, BOARD_STATUSES, ORDER_SORT_PROPERTIES } from "@/constants/orders";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import { toSortParam } from "@/utils/sort-param";
import { api, baseQuery } from "./api";
import { CACHE_TAGS, LIST_ID, orderWriteTags, type CacheTag } from "./cache-tags";

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

function postTo(url: string, body: object): FetchArgs {
  return { url, method: HTTP_METHODS.POST, body };
}

const orderQueriesApi = api.injectEndpoints({
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

const writeStaffOrder: TypedMutationOnQueryStarted<
  StaffOrder,
  OrderPath,
  typeof baseQuery
> = async ({ id }: OrderPath, { dispatch, queryFulfilled }): Promise<void> => {
  try {
    const { data } = await queryFulfilled;
    await dispatch(orderQueriesApi.util.upsertQueryData("getOrder", id, data));
  } catch {
    return;
  }
};

function writeTags(_order: StaffOrder | undefined, error: unknown, { id }: OrderPath): OrderTag[] {
  return orderWriteTags(id, error);
}

export const ordersApi = orderQueriesApi.injectEndpoints({
  endpoints: (build) => ({
    updateOrderStatus: build.mutation<StaffOrder, UpdateOrderStatusArgs>({
      query: ({ id, status }: UpdateOrderStatusArgs): FetchArgs => ({
        url: ORDER_PATHS.STATUS(id),
        method: HTTP_METHODS.PATCH,
        body: { status },
      }),
      onQueryStarted: writeStaffOrder,
      invalidatesTags: writeTags,
    }),
    cancelOrder: build.mutation<StaffOrder, CancelOrderArgs>({
      query: ({ id, ...body }: CancelOrderArgs): FetchArgs => postTo(ORDER_PATHS.CANCEL(id), body),
      onQueryStarted: writeStaffOrder,
      invalidatesTags: writeTags,
    }),
    approveCancellation: build.mutation<StaffOrder, DecideCancellationArgs>({
      query: ({ id, ...body }: DecideCancellationArgs): FetchArgs =>
        postTo(ORDER_PATHS.APPROVE_CANCELLATION(id), body),
      onQueryStarted: writeStaffOrder,
      invalidatesTags: writeTags,
    }),
    declineCancellation: build.mutation<StaffOrder, DecideCancellationArgs>({
      query: ({ id, ...body }: DecideCancellationArgs): FetchArgs =>
        postTo(ORDER_PATHS.DECLINE_CANCELLATION(id), body),
      onQueryStarted: writeStaffOrder,
      invalidatesTags: writeTags,
    }),
  }),
});

export const {
  useGetOrderBoardQuery,
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useApproveCancellationMutation,
  useDeclineCancellationMutation,
} = ordersApi;
