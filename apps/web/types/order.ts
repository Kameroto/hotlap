export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "UPI"
  | "CARD"
  | "NET_BANKING"
  | "WALLET";

export type ShippingMethod =
  | "STANDARD"
  | "EXPRESS";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productImageUrl: string | null;
  productImageAlt: string;
};

export type OrderAddress = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderCoupon = {
  code: string;
  name: string;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  totalQuantity: number;
  total: number;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type OrderDetails =
  OrderSummary & {
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    deliveryAddress: OrderAddress;

    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    taxAmount: number;
    total: number;

    coupon: OrderCoupon | null;
    notes: string | null;

    confirmedAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
  };

export type OrdersResponse = {
  orders: OrderSummary[];
  totalOrders: number;
};

export type OrderDetailsResponse = {
  order: OrderDetails;
};

export type CreateOrderRequest = {
  addressId?: string | null;

  deliveryAddress?: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  shippingMethod:
    | "STANDARD"
    | "EXPRESS";

  paymentMethod:
    | "CASH_ON_DELIVERY"
    | "UPI"
    | "CARD"
    | "NET_BANKING"
    | "WALLET";

  notes?: string | null;
};

export type OrderTimelineStep = {
  status: OrderStatus;
  title: string;
  description: string;
  completedAt?: string;
  isCompleted: boolean;
};