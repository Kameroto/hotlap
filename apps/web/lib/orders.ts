import type {
  OrderDetails,
  OrderStatus,
  OrderTimelineStep,
  PaymentMethod,
  ShippingMethod,
} from "@/types/order";

export function getOrderStatusLabel(
  status: OrderStatus,
): string {
  const labels: Record<
    OrderStatus,
    string
  > = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY:
      "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };

  return labels[status];
}

export function getOrderStatusClassName(
  status: OrderStatus,
): string {
  const classes: Record<
    OrderStatus,
    string
  > = {
    PENDING:
      "bg-slate-100 text-slate-800",

    CONFIRMED:
      "bg-blue-100 text-blue-800",

    PROCESSING:
      "bg-amber-100 text-amber-800",

    SHIPPED:
      "bg-purple-100 text-purple-800",

    OUT_FOR_DELIVERY:
      "bg-orange-100 text-orange-800",

    DELIVERED:
      "bg-green-100 text-green-800",

    CANCELLED:
      "bg-red-100 text-red-800",

    REFUNDED:
      "bg-slate-100 text-slate-800",
  };

  return classes[status];
}

export function getPaymentMethodLabel(
  paymentMethod: PaymentMethod,
): string {
  const labels: Record<
    PaymentMethod,
    string
  > = {
    CASH_ON_DELIVERY:
      "Cash on Delivery",
    UPI: "UPI",
    CARD: "Card",
    NET_BANKING:
      "Net Banking",
    WALLET: "Wallet",
  };

  return labels[
    paymentMethod
  ];
}

export function getShippingMethodLabel(
  shippingMethod: ShippingMethod,
): string {
  return shippingMethod ===
    "EXPRESS"
    ? "Express Delivery"
    : "Standard Delivery";
}

export function formatOrderDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(date),
  );
}

function hasReachedStatus(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
): boolean {
  const progression: OrderStatus[] =
    [
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

  const currentIndex =
    progression.indexOf(
      currentStatus,
    );

  const targetIndex =
    progression.indexOf(
      targetStatus,
    );

  if (
    currentIndex === -1 ||
    targetIndex === -1
  ) {
    return false;
  }

  return (
    currentIndex >=
    targetIndex
  );
}

export function buildOrderTimeline(
  order: OrderDetails,
): OrderTimelineStep[] {
  if (
    order.status ===
      "CANCELLED" ||
    order.status === "REFUNDED"
  ) {
    return [
      {
        status: "CONFIRMED",
        title: "Order confirmed",
        description:
          "Your HotLap order was received.",
        completedAt:
          order.confirmedAt ??
          order.placedAt,
        isCompleted: true,
      },

      {
        status:
          order.status,
        title:
          order.status ===
          "REFUNDED"
            ? "Order refunded"
            : "Order cancelled",
        description:
          order.status ===
          "REFUNDED"
            ? "The order has been refunded."
            : "The order has been cancelled.",
        completedAt:
          order.cancelledAt ??
          order.updatedAt,
        isCompleted: true,
      },
    ];
  }

  return [
    {
      status: "CONFIRMED",
      title: "Order confirmed",
      description:
        "Your HotLap order was received successfully.",
      completedAt:
        order.confirmedAt ??
        order.placedAt,
      isCompleted:
        hasReachedStatus(
          order.status,
          "CONFIRMED",
        ),
    },

    {
      status: "PROCESSING",
      title:
        "Preparing your order",
      description:
        "Your products are being checked and packed.",
      isCompleted:
        hasReachedStatus(
          order.status,
          "PROCESSING",
        ),
    },

    {
      status: "SHIPPED",
      title: "Shipped",
      description:
        "Your order has been handed to the delivery partner.",
      completedAt:
        order.shippedAt ??
        undefined,
      isCompleted:
        hasReachedStatus(
          order.status,
          "SHIPPED",
        ),
    },

    {
      status:
        "OUT_FOR_DELIVERY",
      title:
        "Out for delivery",
      description:
        "Your order is on its way to you.",
      isCompleted:
        hasReachedStatus(
          order.status,
          "OUT_FOR_DELIVERY",
        ),
    },

    {
      status: "DELIVERED",
      title: "Delivered",
      description:
        "Your order has been delivered.",
      completedAt:
        order.deliveredAt ??
        undefined,
      isCompleted:
        hasReachedStatus(
          order.status,
          "DELIVERED",
        ),
    },
  ];
}