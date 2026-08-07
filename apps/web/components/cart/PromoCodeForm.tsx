"use client";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  Tag,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  useCartStore,
} from "@/store/cart-store";

type PromoCodeFormProps = {
  subtotal: number;
};

export default function PromoCodeForm({
  subtotal,
}: PromoCodeFormProps) {
  const [
    promotionCode,
    setPromotionCode,
  ] = useState("");

  const cart =
    useCartStore(
      (state) =>
        state.cart,
    );

  const isLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const applyPromotionCode =
    useCartStore(
      (state) =>
        state.applyPromotionCode,
    );

  const removePromotionCode =
    useCartStore(
      (state) =>
        state.removePromotionCode,
    );

  const coupon =
    cart?.coupon ??
    null;

  async function handleApplyPromotionCode(
    event:
      React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedCode =
      promotionCode
        .trim()
        .toUpperCase();

    if (!normalizedCode) {
      toast.error(
        "Enter a coupon code.",
      );

      return;
    }

    if (subtotal <= 0) {
      toast.error(
        "Add products before applying a coupon.",
      );

      return;
    }

    try {
      await applyPromotionCode(
        normalizedCode,
      );

      setPromotionCode("");

      toast.success(
        `${normalizedCode} applied successfully.`,
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to apply this coupon.";

      toast.error(
        message,
      );
    }
  }

  async function handleRemovePromotionCode(): Promise<void> {
    try {
      await removePromotionCode();

      setPromotionCode("");

      toast.success(
        "Coupon removed.",
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to remove the coupon.";

      toast.error(
        message,
      );
    }
  }

  if (
    coupon &&
    coupon.isValid
  ) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

            <div className="min-w-0">
              <p className="font-semibold text-green-900">
                {
                  coupon.code
                }
              </p>

              {coupon.name && (
                <p className="mt-1 text-sm font-medium text-green-800">
                  {
                    coupon.name
                  }
                </p>
              )}

              {coupon.description && (
                <p className="mt-1 text-sm leading-5 text-green-800">
                  {
                    coupon.description
                  }
                </p>
              )}

              <p className="mt-2 text-sm text-green-700">
                {
                  coupon.message
                }
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={
              isLoading
            }
            aria-label={`Remove coupon ${coupon.code}`}
            onClick={() => {
              void handleRemovePromotionCode();
            }}
            className="shrink-0 text-green-800 hover:bg-green-100 hover:text-green-950"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleApplyPromotionCode
      }
    >
      <label
        htmlFor="cart-promotion-code"
        className="text-sm font-medium"
      >
        Coupon code
      </label>

      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Tag className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            id="cart-promotion-code"
            type="text"
            value={
              promotionCode
            }
            disabled={
              isLoading
            }
            autoComplete="off"
            placeholder="Enter coupon"
            onChange={(
              event,
            ) => {
              setPromotionCode(
                event.target.value.toUpperCase(),
              );
            }}
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-10 text-sm uppercase outline-none transition placeholder:normal-case focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          disabled={
            isLoading ||
            subtotal <= 0 ||
            promotionCode.trim()
              .length === 0
          }
        >
          {isLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Coupon eligibility and discount amounts are verified securely by HotLap at the server.
      </p>
    </form>
  );
}