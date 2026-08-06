import type {
  OrderStatus,
} from "@/types/order";

export function getOrderStatusLabel(
  status: OrderStatus,
): string {
  const statusLabels: Record<
    OrderStatus,
    string
  > = {
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    "out-for-delivery": "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return statusLabels[status];
}

export function getOrderStatusClassName(
  status: OrderStatus,
): string {
  const statusClasses: Record<
    OrderStatus,
    string
  > = {
    confirmed:
      "bg-blue-100 text-blue-800",
    processing:
      "bg-amber-100 text-amber-800",
    shipped:
      "bg-purple-100 text-purple-800",
    "out-for-delivery":
      "bg-orange-100 text-orange-800",
    delivered:
      "bg-green-100 text-green-800",
    cancelled:
      "bg-red-100 text-red-800",
  };

  return statusClasses[status];
}