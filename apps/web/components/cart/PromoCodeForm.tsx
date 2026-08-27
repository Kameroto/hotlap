"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
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

  const isReconciling =
    useCartStore(
      (state) =>
        state.isReconciling,
    );

  const itemMutationIsPending =
    useCartStore(
      (state) =>
        state.pendingProductIds.length >
        0,
    );

  const loadStatus =
    useCartStore(
      (state) =>
        state.loadStatus,
    );

  const operationIsBlocked =
    isLoading ||
    isReconciling ||
    itemMutationIsPending ||
    loadStatus !== "loaded";

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
      const codeWasApplied =
        await applyPromotionCode(
          normalizedCode,
        );

      if (!codeWasApplied) {
        return;
      }

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
      const codeWasRemoved =
        await removePromotionCode();

      if (!codeWasRemoved) {
        return;
      }

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
    coupon
  ) {
    return (
      <div
        className={
          coupon.isValid
            ? "rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4"
            : "rounded-xl border border-primary/25 bg-primary/[0.055] p-4"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            {coupon.isValid ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
            )}

            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {
                  coupon.code
                }
              </p>

              {coupon.name && (
                <p
                  className={
                    coupon.isValid
                      ? "mt-1 text-sm font-medium text-emerald-300"
                      : "mt-1 text-sm font-medium text-primary"
                  }
                >
                  {
                    coupon.name
                  }
                </p>
              )}

              {coupon.description && (
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {
                    coupon.description
                  }
                </p>
              )}

              <p
                className={
                  coupon.isValid
                    ? "mt-2 text-sm text-emerald-300"
                    : "mt-2 text-sm text-muted-foreground"
                }
              >
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
              operationIsBlocked
            }
            aria-label={`Remove coupon ${coupon.code}`}
            onClick={() => {
              void handleRemovePromotionCode();
            }}
            className={
              coupon.isValid
                ? "shrink-0 text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                : "shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
            }
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
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
        className="text-sm font-semibold text-foreground"
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
              operationIsBlocked
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
            className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pr-3 pl-10 text-sm uppercase text-foreground outline-none transition placeholder:normal-case placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          disabled={
            operationIsBlocked ||
            subtotal <= 0 ||
            promotionCode.trim()
              .length === 0
          }
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      <p className="hotlap-supporting-text mt-2 leading-5 text-muted-foreground">
        Eligibility and discount amounts are verified by the HotLap server.
      </p>
    </form>
  );
}
