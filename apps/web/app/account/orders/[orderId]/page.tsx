"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  ArrowLeft,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import OrderActions from "@/components/account/OrderActions";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import ProductImage from "@/components/products/ProductImage";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  getOrderDetails,
} from "@/lib/api/orders";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  buildOrderTimeline,
  formatOrderDate,
  getOrderStatusClassName,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getShippingMethodLabel,
} from "@/lib/orders";

import type {
  OrderDetails,
} from "@/types/order";

export default function OrderDetailsPage() {
  const params =
    useParams<{
      orderId: string;
    }>();

  const [
    order,
    setOrder,
  ] =
    useState<OrderDetails | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let requestIsActive =
      true;

    const orderId =
      params.orderId;

    void getOrderDetails(
      orderId,
    )
      .then((response) => {
        if (
          !requestIsActive
        ) {
          return;
        }

        setOrder(
          response.order,
        );
      })
      .catch(
        (error: unknown) => {
          if (
            !requestIsActive
          ) {
            return;
          }

          setErrorMessage(
            error instanceof
            ApiClientError
              ? error.message
              : "Unable to load this order.",
          );
        },
      )
      .finally(() => {
        if (
          requestIsActive
        ) {
          setIsLoading(
            false,
          );
        }
      });

    return () => {
      requestIsActive =
        false;
    };
  }, [params.orderId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border p-12 text-center">
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-red-600" />

        <p className="mt-3 text-muted-foreground">
          Loading order...
        </p>
      </div>
    );
  }

  if (
    errorMessage ||
    !order
  ) {
    return (
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          {errorMessage ??
            "Order not found."}
        </div>
      </div>
    );
  }

  const timeline =
    buildOrderTimeline(
      order,
    );

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
            {
              order.orderNumber
            }
          </h1>

          <p className="mt-3 text-muted-foreground">
            Placed{" "}
            {formatOrderDate(
              order.placedAt,
            )}
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
              {order.items.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className="grid gap-5 py-5 first:pt-0 last:pb-0 sm:grid-cols-[100px_1fr]"
                  >
                    <div className="overflow-hidden rounded-xl border bg-muted">
                      <ProductImage
                        src={
                          item.productImageUrl ??
                          undefined
                        }
                        alt={
                          item.productImageAlt
                        }
                      />
                    </div>

                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-semibold hover:text-red-600"
                      >
                        {
                          item.productName
                        }
                      </Link>

                      <p className="mt-2 text-sm text-muted-foreground">
                        SKU:{" "}
                        {
                          item.sku
                        }
                      </p>

                      <p className="mt-2 text-sm">
                        Quantity:{" "}
                        {
                          item.quantity
                        }
                      </p>

                      <p className="mt-2 font-semibold">
                        {formatCurrency(
                          item.lineTotal,
                          "INR",
                        )}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-2xl font-semibold">
              Order Progress
            </h2>

            <div className="mt-6">
              <OrderStatusTimeline
                timeline={
                  timeline
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-red-600" />

              <h2 className="text-2xl font-semibold">
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
                    order
                      .deliveryAddress
                      .addressLine2
                  }
                </p>
              )}

              <p>
                {
                  order.deliveryAddress
                    .city
                }
                ,{" "}
                {
                  order.deliveryAddress
                    .state
                }{" "}
                {
                  order.deliveryAddress
                    .postalCode
                }
              </p>

              <p>
                {
                  order.deliveryAddress
                    .country
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

          <OrderActions
            orderId={
              order.orderNumber
            }
            items={
              order.items
            }
          />
        </div>

        <aside className="h-fit space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Subtotal
                </span>

                <span>
                  {formatCurrency(
                    order.subtotal,
                    "INR",
                  )}
                </span>
              </div>

              {order.discountAmount >
                0 && (
                <div className="flex justify-between text-green-700">
                  <span>
                    Discount
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
                <span>
                  Shipping
                </span>

                <span>
                  {order.shippingCost ===
                  0
                    ? "FREE"
                    : formatCurrency(
                        order.shippingCost,
                        "INR",
                      )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>
                  Total
                </span>

                <span>
                  {formatCurrency(
                    order.total,
                    "INR",
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-red-600" />

              <h2 className="font-semibold">
                Payment
              </h2>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {getPaymentMethodLabel(
                order.paymentMethod,
              )}
            </p>

            <p className="mt-2 text-sm font-medium">
              {
                order.paymentStatus
              }
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-red-600" />

              <h2 className="font-semibold">
                Shipping
              </h2>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {getShippingMethodLabel(
                order.shippingMethod,
              )}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}