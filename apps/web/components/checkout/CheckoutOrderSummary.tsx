import {
  PackageCheck,
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
  promotionCode:
    | string
    | null;
  shippingCost: number;
  total: number;

  register:
    UseFormRegister<CheckoutFormValues>;

  acceptTermsError?: FieldError;

  isSubmitting: boolean;
};

export default function CheckoutOrderSummary({
  items,
  subtotal,
  discountAmount,
  promotionCode,
  shippingCost,
  total,
  register,
  acceptTermsError,
  isSubmitting,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
      <h2 className="text-2xl font-semibold">
        Order Summary
      </h2>

      <div className="mt-6 space-y-5">
        {items.map(
          (item) => {
            const product =
              item.product;

            const primaryImage =
              product.images.find(
                (image) =>
                  image.isPrimary,
              ) ??
              product.images[0];

            return (
              <div
                key={item.id}
                className="grid grid-cols-[72px_1fr] gap-4"
              >
                <div className="group overflow-hidden rounded-lg border bg-muted">
                  <ProductImage
                    src={
                      primaryImage?.url
                    }
                    alt={
                      primaryImage?.alt ??
                      product.name
                    }
                  />
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-2 font-medium">
                    {
                      product.name
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Quantity:{" "}
                    {
                      item.quantity
                    }
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {formatCurrency(
                      item.lineTotal,
                      "INR",
                    )}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="mt-6 space-y-4 border-t pt-6">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Subtotal
          </span>

          <span>
            {formatCurrency(
              subtotal,
              "INR",
            )}
          </span>
        </div>

        {discountAmount >
          0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />

              {promotionCode ??
                "Coupon"}
            </span>

            <span>
              -
              {formatCurrency(
                discountAmount,
                "INR",
              )}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Shipping
          </span>

          <span>
            {shippingCost ===
            0
              ? "FREE"
              : formatCurrency(
                  shippingCost,
                  "INR",
                )}
          </span>
        </div>

        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>

          <span>
            {formatCurrency(
              total,
              "INR",
            )}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-muted p-4">
        <div className="flex gap-3">
          <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

          <div>
            <p className="font-medium">
              Cash on Delivery
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Online payments will
              be connected in a
              later payment
              integration batch.
            </p>
          </div>
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          {...register(
            "acceptTerms",
          )}
        />

        <span>
          I agree to the HotLap
          terms and conditions.
        </span>
      </label>

      {acceptTermsError?.message && (
        <p className="mt-2 text-sm text-red-600">
          {
            acceptTermsError.message
          }
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={
          isSubmitting ||
          items.length === 0
        }
        className="mt-6 w-full"
      >
        {isSubmitting
          ? "Placing Order..."
          : "Place Order"}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Final totals and inventory
        are verified securely by
        HotLap before the order is
        created.
      </p>
    </aside>
  );
}