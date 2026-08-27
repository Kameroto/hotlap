import Link from "next/link";

import {
  LoaderCircle,
  PackageCheck,
  ShieldCheck,
  Tag,
} from "lucide-react";

import type {
  FieldError,
  UseFormRegister,
} from "react-hook-form";

import ProductImage from "@/components/products/ProductImage";

import {
  Button,
} from "@/components/ui/button";

import type {
  ServerCartItem,
} from "@/lib/api/types";

import type {
  CheckoutFormValues,
} from "@/lib/checkout-schema";

import {
  formatCurrency,
} from "@/lib/format-currency";

type CheckoutOrderSummaryProps = {
  items: ServerCartItem[];
  subtotal: number;
  discountAmount: number;
  promotionCode: string | null;
  shippingCost: number;
  total: number;
  register:
    UseFormRegister<CheckoutFormValues>;
  confirmationError?: FieldError;
  isSubmitting: boolean;
  isDisabled: boolean;
};

export default function CheckoutOrderSummary({
  items,
  subtotal,
  discountAmount,
  promotionCode,
  shippingCost,
  total,
  register,
  confirmationError,
  isSubmitting,
  isDisabled,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="h-fit self-start rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh_-_7rem)] lg:overflow-y-auto lg:overscroll-contain">
      <p className="hotlap-kicker">
        Final Review
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        Order Summary
      </h2>

      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const product =
            item.product;

          const primaryImage =
            product.images.find(
              (image) =>
                image.isPrimary,
            ) ?? product.images[0];

          return (
            <div
              key={item.id}
              className="grid grid-cols-[72px_minmax(0,1fr)] gap-4"
            >
              <Link
                href={`/products/${product.slug}`}
                aria-label={`View ${product.name}`}
                className="group aspect-square overflow-hidden rounded-xl border border-white/8 bg-[#0b0d0f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ProductImage
                  src={primaryImage?.url}
                  alt={
                    primaryImage?.alt ??
                    product.name
                  }
                  variant="thumbnail"
                />
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                >
                  <span className="line-clamp-2">
                    {product.name}
                  </span>
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {formatCurrency(
                    item.lineTotal,
                    "INR",
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <dl className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Subtotal</dt>
          <dd>
            {formatCurrency(
              subtotal,
              "INR",
            )}
          </dd>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between gap-4 text-emerald-400">
            <dt className="flex items-center gap-2">
              <Tag className="size-4" />
              {promotionCode ?? "Coupon"}
            </dt>
            <dd>
              -{formatCurrency(
                discountAmount,
                "INR",
              )}
            </dd>
          </div>
        )}

        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Shipping</dt>
          <dd>
            {shippingCost === 0
              ? "Free"
              : formatCurrency(
                  shippingCost,
                  "INR",
                )}
          </dd>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between gap-4 text-lg font-bold text-foreground">
            <dt>Total</dt>
            <dd>
              {formatCurrency(
                total,
                "INR",
              )}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.055] p-4">
        <div className="flex gap-3">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-foreground">
              Cash on Delivery
            </p>
            <p className="hotlap-supporting-text mt-1 leading-5 text-muted-foreground">
              Cash on Delivery is the currently available payment method for this order.
            </p>
          </div>
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background">
        <input
          type="checkbox"
          aria-invalid={
            Boolean(
              confirmationError,
            )
          }
          aria-describedby={
            confirmationError
              ? "checkout-confirmation-error"
              : undefined
          }
          className="mt-1 size-4 accent-primary"
          {...register(
            "confirmOrderDetails",
          )}
        />
        <span className="text-sm leading-6 text-foreground">
          I confirm that my delivery and order details are correct.
        </span>
      </label>

      {confirmationError?.message && (
        <p
          id="checkout-confirmation-error"
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {confirmationError.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={
          isSubmitting ||
          isDisabled ||
          items.length === 0
        }
        aria-busy={isSubmitting}
        className="mt-6 w-full"
      >
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
        {isSubmitting
          ? "Placing Order..."
          : "Place Order"}
      </Button>

      <p className="hotlap-supporting-text mt-3 text-center leading-5 text-muted-foreground">
        Final prices, discounts, shipping, and inventory are verified by HotLap when the order is created.
      </p>
    </aside>
  );
}
