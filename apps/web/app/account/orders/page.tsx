"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  LoaderCircle,
  Package,
} from "lucide-react";

import {
  getOrders,
} from "@/lib/api/orders";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  formatOrderDate,
  getOrderStatusClassName,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/orders";

import type {
  OrderSummary,
} from "@/types/order";

export default function OrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<OrderSummary[]>(
    [],
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

    void getOrders()
      .then((response) => {
        if (
          !requestIsActive
        ) {
          return;
        }

        setOrders(
          response.orders,
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
              : "Unable to load your orders.",
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
  }, []);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Orders
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Order History
      </h1>

      <p className="mt-4 text-muted-foreground">
        View your HotLap purchases
        and delivery progress.
      </p>

      {isLoading ? (
        <div className="mt-10 rounded-2xl border p-12 text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-red-600" />

          <p className="mt-3 text-muted-foreground">
            Loading orders...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          {errorMessage}
        </div>
      ) : orders.length >
        0 ? (
        <div className="mt-10 space-y-5">
          {orders.map(
            (order) => (
              <article
                key={
                  order.id
                }
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        order.orderNumber
                      }
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatOrderDate(
                        order.placedAt,
                      )}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getOrderStatusClassName(
                      order.status,
                    )}`}
                  >
                    {getOrderStatusLabel(
                      order.status,
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Items
                    </p>

                    <p className="mt-1 font-semibold">
                      {
                        order.totalQuantity
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment
                    </p>

                    <p className="mt-1 font-semibold">
                      {getPaymentMethodLabel(
                        order.paymentMethod,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total
                    </p>

                    <p className="mt-1 font-bold">
                      {formatCurrency(
                        order.total,
                        "INR",
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package className="h-5 w-5" />

                    <span>
                      {order.items
                        .map(
                          (item) =>
                            item.productName,
                        )
                        .join(
                          ", ",
                        )}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="flex shrink-0 items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
                  >
                    View Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed px-6 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            Your completed HotLap
            orders will appear here.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-block font-semibold text-red-600 hover:underline"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}