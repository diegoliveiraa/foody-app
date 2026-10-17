import type { components, operations } from "./api";

export type CustomerOrder = components["schemas"]["CustomerOrderDetailResponse"];

export type CustomerOrderSummary = components["schemas"]["CustomerOrderSummaryResponse"];

export type CustomerOrderPage = components["schemas"]["PageResponseCustomerOrderSummaryResponse"];

export type CustomerOrderHistoryEntry = components["schemas"]["CustomerOrderHistoryEntry"];

export type StaffOrder = components["schemas"]["StaffOrderDetailResponse"];

export type StaffOrderSummary = components["schemas"]["StaffOrderSummaryResponse"];

export type StaffOrderPage = components["schemas"]["PageResponseStaffOrderSummaryResponse"];

export type StaffOrderHistoryEntry = components["schemas"]["StaffOrderHistoryEntry"];

export type OrderStatus = StaffOrderSummary["status"];

export type OrderItem = components["schemas"]["OrderItemResponse"];

export type OrderItemSummary = components["schemas"]["OrderItemSummary"];

export type OrderCancellation = components["schemas"]["OrderCancellationResponse"];

export type CancellationReason = OrderCancellation["reason"];

export type ActorSide = OrderCancellation["cancelledBy"];

export type DeliveryAddress = components["schemas"]["DeliveryAddressResponse"];

export type DeliveryAddressRequest = components["schemas"]["DeliveryAddressRequest"];

export type BrazilianState = DeliveryAddressRequest["state"];

export type PlaceOrderRequest = components["schemas"]["PlaceOrderRequest"];

export type ListMyOrdersParams = NonNullable<operations["myOrderList"]["parameters"]["query"]>;

export type ListOrdersParams = NonNullable<operations["orderList"]["parameters"]["query"]>;

export type OrderId = operations["orderDetail"]["parameters"]["path"]["id"];

export type OrderPath = operations["orderUpdateStatus"]["parameters"]["path"];

export type UpdateOrderStatusRequest = components["schemas"]["UpdateOrderStatusRequest"];

export type CancelOrderRequest = components["schemas"]["CancelOrderRequest"];

export type CancellationDecisionRequest = components["schemas"]["CancellationDecisionRequest"];

export type UpdateOrderStatusArgs = OrderPath & UpdateOrderStatusRequest;

export type CancelOrderArgs = OrderPath & CancelOrderRequest;

export type DecideCancellationArgs = OrderPath & CancellationDecisionRequest;

export type StaffCancellationRequest = components["schemas"]["StaffCancellationRequestResponse"];

export type CustomerCancellationRequest =
  components["schemas"]["CustomerCancellationRequestResponse"];

export type CancellationRequestStatus = StaffCancellationRequest["status"];
