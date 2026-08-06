import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

import OrderActions from "@/components/account/OrderActions";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import ProductImage from "@/components/products/ProductImage";

import {
  getAllOrders,
  getOrderById,
} from "@/data/orders";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  getOrderStatusClassName,
  getOrderStatusLabel,
} from "@/lib/orders";

type OrderDetailsPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export function generateStaticParams() {
  return getAllOrders().map((order) => ({
    orderId: order.id,
  }));
}

export async function generateMetadata({
  params,
}: OrderDetailsPageProps): Promise<Metadata> {
  const { orderId } = await params;

  const order = getOrderById(orderId);

  if (!order) {
    return {
      title: "Order Not Found",
    };
  }

  return {
    title: `Order ${order.id}`,
    description:
      "View your HotLap order details and delivery status.",
  };
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;

  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
            Order Details
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {order.id}
          </h1>

          <p className="mt-3 text-muted-foreground">
            Placed on {order.placedOn}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getOrderStatusClassName(
            order.status,
          )}`}
        >
          {getOrderStatusLabel(
            order.status,
          )}
        </span>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-red-600" />

              <h2 className="text-2xl font-semibold">
                Products
              </h2>
            </div>

            <div className="mt-6 divide-y">
              {order.items.map((item) => (
                <article
                  key={item.productId}
                  className="grid gap-5 py-6 first:pt-0 last:pb-0 sm:grid-cols-[120px_1fr]"
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="group overflow-hidden rounded-xl border bg-muted"
                  >
                    <ProductImage
                      src={item.productImageUrl}
                      alt={item.productImageAlt}
                    />
                  </Link>

                  <div className="flex flex-col justify-center">
                    <Link
                      href={`/products/${item.productSlug}`}
                    >
                      <h3 className="text-lg font-semibold hover:text-red-600">
                        {item.productName}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-3 font-bold">
                      {formatCurrency(
                        item.unitPrice *
                          item.quantity,
                        "INR",
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-2xl font-semibold">
              Shipment Progress
            </h2>

            <div className="mt-7">
              <OrderStatusTimeline
                timeline={order.timeline}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-red-600" />

              <h2 className="text-xl font-semibold">
                Delivery Address
              </h2>
            </div>

            <address className="mt-5 not-italic leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">
                {
                  order.deliveryAddress
                    .recipientName
                }
              </p>

              <p>
                {
                  order.deliveryAddress
                    .addressLine1
                }
              </p>

              {order.deliveryAddress
                .addressLine2 && (
                <p>
                  {
                    order.deliveryAddress
                      .addressLine2
                  }
                </p>
              )}

              <p>
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.state}{" "}
                {
                  order.deliveryAddress
                    .postalCode
                }
              </p>

              <p className="mt-2">
                +91{" "}
                {
                  order.deliveryAddress
                    .phone
                }
              </p>
            </address>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-red-600" />

              <h2 className="text-xl font-semibold">
                Payment Summary
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(
                    order.subtotal,
                    "INR",
                  )}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>
                    Discount
                    {order.appliedPromotionCode
                      ? ` (${order.appliedPromotionCode})`
                      : ""}
                  </span>

                  <span>
                    -
                    {formatCurrency(
                      order.discountAmount,
                      "INR",
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>

                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatCurrency(
                        order.shippingCost,
                        "INR",
                      )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total</span>

                <span>
                  {formatCurrency(
                    order.total,
                    "INR",
                  )}
                </span>
              </div>

              <p className="border-t pt-4 text-sm text-muted-foreground">
                Payment method:{" "}
                <span className="font-medium text-foreground">
                  {order.paymentMethod}
                </span>
              </p>
            </div>
          </section>

          <OrderActions
            orderId={order.id}
            items={order.items}
          />
        </div>
      </div>
    </div>
  );
}