"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
  Package,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  getOrders,
} from "@/lib/api/orders";

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
  const [orders, setOrders] =
    useState<OrderSummary[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadOrders = useCallback(
    async (signal?: AbortSignal) => {
      if (signal?.aborted) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await getOrders();

        if (signal?.aborted) {
          return;
        }

        setOrders(response.orders);
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiClientError
            ? error.message
            : "Unable to load your orders.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    queueMicrotask(() => {
      void loadOrders(
        controller.signal,
      );
    });

    return () => {
      controller.abort();
    };
  }, [loadOrders]);

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(255,106,0,0.10),rgba(16,19,22,0.96)_42%,rgba(8,10,12,0.98))] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Customer garage
          </p>

          <h1 className="mt-3 break-words text-3xl font-black tracking-[-0.035em] text-foreground sm:text-4xl">
            Order history
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review your HotLap purchases,
            current status, and order details.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div
          className="mt-8 rounded-3xl border border-border bg-card/80 px-5 py-14 text-center shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:px-8"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-primary motion-reduce:animate-none" />

          <p className="mt-4 font-medium text-foreground">
            Loading your orders…
          </p>
        </div>
      ) : errorMessage ? (
        <div
          className="mt-8 rounded-3xl border border-destructive/35 bg-destructive/8 px-5 py-8 sm:px-8"
          role="alert"
        >
          <AlertTriangle className="h-7 w-7 text-destructive" />

          <h2 className="mt-4 text-xl font-bold text-foreground">
            Orders could not be loaded
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {errorMessage} Your order history
            has not been replaced with an empty
            list.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => {
              void loadOrders();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : orders.length > 0 ? (
        <div className="mt-8 space-y-5">
          {orders.map((order) => {
            const statusLabel =
              getOrderStatusLabel(
                order.status,
              );

            const itemLabel = `${order.totalQuantity} ${
              order.totalQuantity === 1
                ? "item"
                : "items"
            }`;

            return (
              <article
                key={order.id}
                className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-colors hover:border-primary/35 motion-reduce:transition-none sm:p-7"
              >
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="hotlap-supporting-text font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Order reference
                    </p>

                    <h2 className="mt-2 break-all text-xl font-black tracking-tight text-foreground">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatOrderDate(
                        order.placedAt,
                      )}
                    </p>
                  </div>

                  <span
                    className={`w-fit max-w-full rounded-full px-3 py-1.5 text-xs font-bold ${getOrderStatusClassName(
                      order.status,
                    )}`}
                  >
                    <span className="sr-only">
                      Order status:{" "}
                    </span>
                    {statusLabel}
                  </span>
                </div>

                <dl className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Items
                    </dt>
                    <dd className="mt-1 font-semibold text-foreground">
                      {itemLabel}
                    </dd>
                  </div>

                  <div>
                    <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Payment
                    </dt>
                    <dd className="mt-1 break-words font-semibold text-foreground">
                      {getPaymentMethodLabel(
                        order.paymentMethod,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Total
                    </dt>
                    <dd className="mt-1 font-black text-foreground">
                      {formatCurrency(
                        order.total,
                        "INR",
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex min-w-0 flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3 text-sm text-muted-foreground">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="min-w-0 break-words leading-6">
                      {order.items
                        .map(
                          (item) =>
                            item.productName,
                        )
                        .join(", ")}
                    </p>
                  </div>

                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg font-semibold text-primary outline-none transition hover:text-[#ff7a00] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:self-auto"
                  >
                    View order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/60 px-5 py-14 text-center sm:px-8 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <Package className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Your order history is empty
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Completed HotLap checkouts will
            appear here with their current order
            status.
          </p>

          <Link
            href="/products"
            className={buttonVariants({
              size: "lg",
              className: "mt-7",
            })}
          >
            Browse products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
