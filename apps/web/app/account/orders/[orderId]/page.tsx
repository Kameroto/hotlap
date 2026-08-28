"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";

import OrderActions from "@/components/account/OrderActions";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import ProductImage from "@/components/products/ProductImage";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

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
  getPaymentStatusLabel,
  getShippingMethodLabel,
} from "@/lib/orders";

import type {
  OrderDetails,
  OrderItem,
} from "@/types/order";

export default function OrderDetailsPage() {
  const params = useParams<{
    orderId: string;
  }>();

  const [order, setOrder] =
    useState<OrderDetails | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [orderWasNotFound, setOrderWasNotFound] =
    useState(false);

  const [showSuccessConfirmation, setShowSuccessConfirmation] =
    useState(false);

  const loadOrder = useCallback(
    async (signal?: AbortSignal) => {
      if (signal?.aborted) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setOrderWasNotFound(false);
      setShowSuccessConfirmation(false);

      try {
        const response =
          await getOrderDetails(
            params.orderId,
          );

        if (signal?.aborted) {
          return;
        }

        setOrder(response.order);

        const currentUrl = new URL(
          window.location.href,
        );

        const confirmationMarker =
          currentUrl.searchParams.get(
            "placed",
          );

        if (confirmationMarker) {
          let storedMarker:
            | string
            | null = null;

          try {
            storedMarker =
              window.sessionStorage.getItem(
                "hotlap-order-confirmation",
              );

            window.sessionStorage.removeItem(
              "hotlap-order-confirmation",
            );
          } catch {
            storedMarker = null;
          }

          if (
            storedMarker ===
            confirmationMarker
          ) {
            setShowSuccessConfirmation(true);
          }

          currentUrl.searchParams.delete(
            "placed",
          );

          window.history.replaceState(
            window.history.state,
            "",
            `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
          );
        }
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        if (
          error instanceof ApiClientError &&
          (error.statusCode === 404 ||
            error.statusCode === 400)
        ) {
          setOrderWasNotFound(true);
          setErrorMessage(null);
          return;
        }

        setErrorMessage(
          error instanceof ApiClientError
            ? error.message
            : "Unable to load this order.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [params.orderId],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    queueMicrotask(() => {
      void loadOrder(
        controller.signal,
      );
    });

    return () => {
      controller.abort();
    };
  }, [loadOrder]);

  if (isLoading) {
    return (
      <div
        className="rounded-3xl border border-border bg-card/80 px-5 py-16 text-center shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:px-8"
        role="status"
        aria-live="polite"
      >
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary motion-reduce:animate-none" />

        <p className="mt-4 font-medium text-foreground">
          Loading order details…
        </p>
      </div>
    );
  }

  if (orderWasNotFound) {
    return (
      <OrderUnavailableState
        title="Order not found"
        message="This order could not be found in your account. Check the order reference or return to your order history."
      />
    );
  }

  if (errorMessage || !order) {
    return (
      <OrderUnavailableState
        title="Order could not be loaded"
        message={
          errorMessage ??
          "The order details are temporarily unavailable."
        }
        onRetry={() => {
          void loadOrder();
        }}
      />
    );
  }

  const timeline =
    buildOrderTimeline(order);

  const statusLabel =
    getOrderStatusLabel(
      order.status,
    );

  return (
    <div className="min-w-0">
      {showSuccessConfirmation && (
        <section
          className="mb-7 overflow-hidden rounded-3xl border border-[var(--hotlap-success)]/35 bg-[linear-gradient(135deg,rgba(41,195,106,0.16),rgba(16,19,22,0.94)_58%)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:p-7"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hotlap-success)]/15 text-[var(--hotlap-success)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--hotlap-success)]">
                Checkout complete
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Order placed successfully
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your confirmed order details are
                shown below.
              </p>
            </div>
          </div>
        </section>
      )}

      <Link
        href="/account/orders"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <ArrowLeft className="h-4 w-4" />
        View orders
      </Link>

      <header className="relative mt-4 min-w-0 overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(255,106,0,0.10),rgba(16,19,22,0.96)_42%,rgba(8,10,12,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Order details
            </p>

            <h1 className="mt-3 break-all text-3xl font-black tracking-[-0.04em] text-foreground sm:text-4xl">
              {order.orderNumber}
            </h1>

            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Placed{" "}
              {formatOrderDate(
                order.placedAt,
              )}
            </p>
          </div>

          <span
            className={`w-fit max-w-full rounded-full px-4 py-2 text-[0.875rem] font-bold ${getOrderStatusClassName(
              order.status,
            )}`}
          >
            <span className="sr-only">
              Current order status:{" "}
            </span>
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <section className="min-w-0 rounded-3xl border border-border bg-card/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] sm:p-7">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Products
              </h2>
            </div>

            <div className="mt-6 divide-y divide-border">
              {order.items.map((item) => (
                <OrderProductLine
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Current status
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Order progress
            </h2>

            <div className="mt-7">
              <OrderStatusTimeline
                timeline={timeline}
              />
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-border bg-card/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] sm:p-7">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Delivery address
              </h2>
            </div>

            <address className="mt-5 min-w-0 break-words not-italic leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">
                {order.deliveryAddress.recipientName}
              </p>
              <p>{order.deliveryAddress.addressLine1}</p>
              {order.deliveryAddress.addressLine2 && (
                <p>{order.deliveryAddress.addressLine2}</p>
              )}
              <p>
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.state}{" "}
                {order.deliveryAddress.postalCode}
              </p>
              <p>{order.deliveryAddress.country}</p>
              <p className="mt-2 break-all">
                +91 {order.deliveryAddress.phone}
              </p>
            </address>
          </section>

          <div className="rounded-3xl border border-border bg-card/60 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">
              Buy these products again
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Current catalogue availability and
              stock are checked when products are
              added to your cart.
            </p>
            <div className="mt-5">
              <OrderActions
                items={order.items}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
            >
              <ShoppingBag className="h-4 w-4" />
              View orders
            </Link>
            <Link
              href="/products"
              className={buttonVariants({
                size: "lg",
              })}
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="h-fit min-w-0 space-y-6 xl:sticky xl:top-28">
          <section className="rounded-3xl border border-primary/20 bg-card/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Final total
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Order summary
            </h2>

            <dl className="mt-6 space-y-4 text-sm">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  order.subtotal,
                  "INR",
                )}
              />

              {order.discountAmount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-${formatCurrency(
                    order.discountAmount,
                    "INR",
                  )}`}
                  emphasized
                />
              )}

              {order.coupon && (
                <div className="rounded-xl border border-[var(--hotlap-success)]/25 bg-[var(--hotlap-success)]/8 px-3 py-3">
                  <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-[var(--hotlap-success)]">
                    Coupon applied
                  </dt>
                  <dd className="mt-1 break-words font-semibold text-foreground">
                    {order.coupon.code} ·{" "}
                    {order.coupon.name}
                  </dd>
                </div>
              )}

              <SummaryRow
                label="Shipping"
                value={
                  order.shippingCost === 0
                    ? "Free"
                    : formatCurrency(
                        order.shippingCost,
                        "INR",
                      )
                }
              />

              <div className="flex items-start justify-between gap-4 border-t border-border pt-5 text-lg font-black text-foreground">
                <dt>Total</dt>
                <dd className="text-right">
                  {formatCurrency(
                    order.total,
                    "INR",
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-border bg-card/90 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">
                Payment
              </h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {getPaymentMethodLabel(
                order.paymentMethod,
              )}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {getPaymentStatusLabel(
                order.paymentStatus,
                order.paymentMethod,
              )}
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card/90 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">
                Shipping method
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

function OrderProductLine({
  item,
}: {
  item: OrderItem;
}) {
  const productContent = (
    <>
      <span className="break-words font-bold text-foreground transition-colors group-hover:text-primary motion-reduce:transition-none">
        {item.productName}
      </span>
      <span className="mt-2 block break-all text-sm text-muted-foreground">
        SKU: {item.sku}
      </span>
    </>
  );

  return (
    <article className="grid min-w-0 gap-5 py-6 first:pt-0 last:pb-0 sm:grid-cols-[104px_minmax(0,1fr)]">
      <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        <ProductImage
          src={item.productImageUrl ?? undefined}
          alt={item.productImageAlt}
        />
      </div>

      <div className="min-w-0">
        {item.productId ? (
          <Link
            href={`/products/${item.productSlug}`}
            className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {productContent}
          </Link>
        ) : (
          <div>
            {productContent}
            <p className="hotlap-supporting-text mt-2 text-muted-foreground">
              This historical product is no
              longer in the catalogue.
            </p>
          </div>
        )}

        <dl className="mt-5 grid min-w-0 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">
              Unit price × quantity
            </dt>
            <dd className="mt-1 break-words font-semibold text-foreground">
              {formatCurrency(
                item.unitPrice,
                "INR",
              )}{" "}
              × {item.quantity}
            </dd>
          </div>
          <div className="sm:text-right">
            <dt className="text-muted-foreground">
              Line total
            </dt>
            <dd className="mt-1 font-black text-foreground">
              {formatCurrency(
                item.lineTotal,
                "INR",
              )}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${
        emphasized
          ? "text-[var(--hotlap-success)]"
          : "text-muted-foreground"
      }`}
    >
      <dt>{label}</dt>
      <dd className="text-right font-semibold">
        {value}
      </dd>
    </div>
  );
}

function OrderUnavailableState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-w-0">
      <Link
        href="/account/orders"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <ArrowLeft className="h-4 w-4" />
        View orders
      </Link>

      <div
        className="mt-5 rounded-3xl border border-destructive/35 bg-destructive/8 px-5 py-10 sm:px-8"
        role="alert"
      >
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h1 className="mt-5 break-words text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button
              type="button"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
          <Link
            href="/account/orders"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            View order history
          </Link>
        </div>
      </div>
    </div>
  );
}
