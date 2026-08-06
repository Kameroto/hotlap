import type { Order } from "@/types/order";

export const orders: Order[] = [
  {
    id: "HL-7A91C3F2",
    placedOn: "2 August 2026",
    status: "processing",

    items: [
      {
        productId: "prod-001",
        productName: "MJX Hyper Go 14301",
        productSlug: "mjx-hyper-go-14301",
        productImageUrl:
          "/products/mjx-hyper-go-14301.jpg",
        productImageAlt:
          "MJX Hyper Go 14301 RC car",
        quantity: 1,
        unitPrice: 12999,
      },
      {
        productId: "prod-003",
        productName:
          "Hardcase LiPo Battery 5200mAh",
        productSlug:
          "hardcase-lipo-battery-5200mah",
        productImageUrl:
          "/products/lipo-battery-5200mah.jpg",
        productImageAlt:
          "Hardcase LiPo Battery 5200mAh",
        quantity: 1,
        unitPrice: 3499,
      },
    ],

    deliveryAddress: {
      recipientName: "Tanmay Saini",
      addressLine1: "12, Example Residency",
      addressLine2: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      phone: "9876543210",
    },

    timeline: [
      {
        status: "confirmed",
        title: "Order confirmed",
        description:
          "Your HotLap order was received successfully.",
        completedAt: "2 August 2026, 10:32 AM",
        isCompleted: true,
      },
      {
        status: "processing",
        title: "Preparing your order",
        description:
          "The products are being checked and packed.",
        completedAt: "2 August 2026, 2:15 PM",
        isCompleted: true,
      },
      {
        status: "shipped",
        title: "Shipped",
        description:
          "Your order will be handed to the delivery partner.",
        isCompleted: false,
      },
      {
        status: "out-for-delivery",
        title: "Out for delivery",
        description:
          "The delivery partner is bringing your order.",
        isCompleted: false,
      },
      {
        status: "delivered",
        title: "Delivered",
        description:
          "Your order has been delivered.",
        isCompleted: false,
      },
    ],

    subtotal: 16498,
    discountAmount: 1500,
    shippingCost: 0,
    total: 14998,
    paymentMethod: "Cash on Delivery",
    appliedPromotionCode: "HOTLAP10",
  },

  {
    id: "HL-4B82D1A6",
    placedOn: "18 July 2026",
    status: "delivered",

    items: [
      {
        productId: "prod-002",
        productName: "WLtoys 124019",
        productSlug: "wltoys-124019",
        productImageUrl:
          "/products/wltoys-124019.jpg",
        productImageAlt:
          "WLtoys 124019 RC buggy",
        quantity: 1,
        unitPrice: 9999,
      },
    ],

    deliveryAddress: {
      recipientName: "Tanmay Saini",
      addressLine1: "12, Example Residency",
      addressLine2: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      phone: "9876543210",
    },

    timeline: [
      {
        status: "confirmed",
        title: "Order confirmed",
        description:
          "Your HotLap order was received successfully.",
        completedAt: "18 July 2026, 9:20 AM",
        isCompleted: true,
      },
      {
        status: "processing",
        title: "Preparing your order",
        description:
          "The product was checked and packed.",
        completedAt: "18 July 2026, 12:40 PM",
        isCompleted: true,
      },
      {
        status: "shipped",
        title: "Shipped",
        description:
          "The order was handed to the delivery partner.",
        completedAt: "19 July 2026, 11:10 AM",
        isCompleted: true,
      },
      {
        status: "out-for-delivery",
        title: "Out for delivery",
        description:
          "The delivery partner was bringing your order.",
        completedAt: "21 July 2026, 8:30 AM",
        isCompleted: true,
      },
      {
        status: "delivered",
        title: "Delivered",
        description:
          "Your order was delivered successfully.",
        completedAt: "21 July 2026, 2:05 PM",
        isCompleted: true,
      },
    ],

    subtotal: 9999,
    discountAmount: 0,
    shippingCost: 0,
    total: 9999,
    paymentMethod: "UPI",
  },
];

export function getAllOrders(): Order[] {
  return orders;
}

export function getOrderById(
  orderId: string,
): Order | undefined {
  return orders.find(
    (order) => order.id === orderId,
  );
}