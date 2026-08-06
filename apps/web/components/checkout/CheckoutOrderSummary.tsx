import Link from "next/link";

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
  buttonVariants,
} from "@/components/ui/button";

import type { Product } from "@/types/product";

import type { CheckoutFormValues } from "@/lib/checkout-schema";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type CheckoutCartProduct = {
  product: Product;
  quantity: number;
};

type CheckoutOrderSummaryProps = {
  cartProducts: CheckoutCartProduct[];
  subtotal: number;
  discountAmount: number;
  appliedPromotionCode: string | null;
  shippingCost: number;
  total: number;
  register: UseFormRegister<CheckoutFormValues>;
  acceptTermsError?: FieldError;
  isSubmitting: boolean;
};

export default function CheckoutOrderSummary({
  cartProducts,
  subtotal,
  discountAmount,
  appliedPromotionCode,
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
        {cartProducts.map(
          ({ product, quantity }) => {
            const primaryImage =
              product.images[0];

            return (
              <div
                key={product.id}
                className="grid grid-cols-[72px_1fr] gap-4"
              >
                <div className="group overflow-hidden rounded-lg border bg-muted">
                  <ProductImage
                    src={primaryImage?.url}
                    alt={
                      primaryImage?.alt ??
                      product.name
                    }
                  />
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-2 font-medium">
                    {product.name}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Quantity: {quantity}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {formatCurrency(
                      product.price * quantity,
                      product.currency,
                    )}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>

      {appliedPromotionCode &&
        discountAmount > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            <Tag className="h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                {appliedPromotionCode}
              </p>

              <p className="text-sm">
                Coupon discount applied
              </p>
            </div>
          </div>
        )}

      <div className="mt-6 space-y-4 border-t pt-6">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>

          <span>
            {formatCurrency(
              subtotal,
              "INR",
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Coupon discount</span>

            <span>
              -
              {formatCurrency(
                discountAmount,
                "INR",
              )}
            </span>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>

          <span>
            {shippingCost === 0
              ? "Free"
              : formatCurrency(
                  shippingCost,
                  "INR",
                )}
          </span>
        </div>

        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>

          <span>
            {formatCurrency(total, "INR")}
          </span>
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          {...register("acceptTerms")}
        />

        <span>
          I agree to the terms, privacy
          policy, and order conditions.
        </span>
      </label>

      {acceptTermsError?.message && (
        <p className="mt-2 text-sm text-red-600">
          {acceptTermsError.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-6 w-full"
      >
        <PackageCheck className="h-5 w-5" />

        {isSubmitting
          ? "Placing Order..."
          : `Place Order • ${formatCurrency(
              total,
              "INR",
            )}`}
      </Button>

      <Link
        href="/cart"
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "lg",
          }),
          "mt-3 w-full",
        )}
      >
        Return to Cart
      </Link>
    </aside>
  );
}