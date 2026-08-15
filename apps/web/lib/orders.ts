import type {
  OrderDetails,
  OrderStatus,
  OrderTimelineStep,
  PaymentMethod,
  PaymentStatus,
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
      "border border-border bg-muted text-muted-foreground",

    CONFIRMED:
      "border border-primary/25 bg-primary/10 text-primary",

    PROCESSING:
      "border border-amber-400/30 bg-amber-400/10 text-amber-300",

    SHIPPED:
      "border border-violet-400/30 bg-violet-400/10 text-violet-300",

    OUT_FOR_DELIVERY:
      "border border-orange-400/30 bg-orange-400/10 text-orange-300",

    DELIVERED:
      "border border-[var(--hotlap-success)]/30 bg-[var(--hotlap-success)]/10 text-[var(--hotlap-success)]",

    CANCELLED:
      "border border-destructive/30 bg-destructive/10 text-destructive",

    REFUNDED:
      "border border-border bg-muted text-muted-foreground",
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

export function getPaymentStatusLabel(
  paymentStatus: PaymentStatus,
  paymentMethod: PaymentMethod,
): string {
  if (
    paymentMethod ===
      "CASH_ON_DELIVERY" &&
    paymentStatus === "PENDING"
  ) {
    return "Payment due on delivery";
  }

  const labels: Record<
    PaymentStatus,
    string
  > = {
    PENDING: "Payment pending",
    AUTHORIZED: "Payment authorized",
    PAID: "Paid",
    FAILED: "Payment failed",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED:
      "Partially refunded",
  };

  return labels[paymentStatus];
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
      "PENDING",
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
        status: "PENDING",
        title: "Order received",
        description:
          "Your HotLap order was received.",
        completedAt:
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
          undefined,
        isCompleted: true,
      },
    ];
  }

  return [
    {
      status: "PENDING",
      title: "Order received",
      description:
        "HotLap received your order.",
      completedAt:
        order.placedAt,
      isCompleted: true,
    },

    {
      status: "CONFIRMED",
      title: "Order confirmed",
      description:
        hasReachedStatus(
          order.status,
          "CONFIRMED",
        )
          ? "Your HotLap order was confirmed."
          : "Confirmation is the next order stage.",
      completedAt:
        order.confirmedAt ??
        undefined,
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
        hasReachedStatus(
          order.status,
          "PROCESSING",
        )
          ? "Your order entered preparation."
          : "Order preparation is the next stage after confirmation.",
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
        hasReachedStatus(
          order.status,
          "SHIPPED",
        )
          ? "Your order was marked as shipped."
          : "This stage will be updated when the order is shipped.",
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
        hasReachedStatus(
          order.status,
          "OUT_FOR_DELIVERY",
        )
          ? "Your order was marked as out for delivery."
          : "This stage will be updated when the order is out for delivery.",
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
        hasReachedStatus(
          order.status,
          "DELIVERED",
        )
          ? "Your order was marked as delivered."
          : "This stage will be updated after delivery is confirmed.",
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
