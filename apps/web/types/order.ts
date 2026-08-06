export type OrderStatus =
  | "confirmed"
  | "processing"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  productImageAlt: string;
  quantity: number;
  unitPrice: number;
};

export type OrderAddress = {
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

export type OrderTimelineStep = {
  status: OrderStatus;
  title: string;
  description: string;
  completedAt?: string;
  isCompleted: boolean;
};

export type Order = {
  id: string;
  placedOn: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryAddress: OrderAddress;
  timeline: OrderTimelineStep[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  appliedPromotionCode?: string;
};