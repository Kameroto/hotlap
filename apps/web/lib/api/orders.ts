import {
  apiRequest,
} from "@/lib/api/client";

import type {
  CreateOrderRequest,
  OrderDetailsResponse,
  OrdersResponse,
} from "@/types/order";

export async function createOrder(
  request: CreateOrderRequest,
): Promise<OrderDetailsResponse> {
  return apiRequest<OrderDetailsResponse>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(
        request,
      ),
    },
  );
}

export async function getOrders(): Promise<OrdersResponse> {
  return apiRequest<OrdersResponse>(
    "/orders",
  );
}

export async function getOrderDetails(
  orderId: string,
): Promise<OrderDetailsResponse> {
  return apiRequest<OrderDetailsResponse>(
    `/orders/${encodeURIComponent(
      orderId,
    )}`,
  );
}