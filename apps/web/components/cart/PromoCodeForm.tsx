"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  TicketPercent,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  normalizePromotionCode,
  validatePromotion,
} from "@/lib/promotions";

import { useCartStore } from "@/store/cart-store";

type PromoCodeFormProps = {
  subtotal: number;
};

export default function PromoCodeForm({
  subtotal,
}: PromoCodeFormProps) {
  const appliedPromotionCode = useCartStore(
    (state) => state.appliedPromotionCode,
  );

  const applyPromotionCode = useCartStore(
    (state) => state.applyPromotionCode,
  );

  const removePromotionCode = useCartStore(
    (state) => state.removePromotionCode,
  );

  const [promotionCode, setPromotionCode] = useState(
    appliedPromotionCode ?? "",
  );

  const [feedbackMessage, setFeedbackMessage] =
    useState("");

  const [hasError, setHasError] = useState(false);

  const activeValidation = appliedPromotionCode
    ? validatePromotion(
        appliedPromotionCode,
        subtotal,
      )
    : null;

  useEffect(() => {
    if (
      !appliedPromotionCode ||
      activeValidation?.isValid !== false
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      removePromotionCode();
      setPromotionCode("");
      setFeedbackMessage(
        activeValidation.message,
      );
      setHasError(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeValidation,
    appliedPromotionCode,
    removePromotionCode,
  ]);

  function handleApplyPromotion() {
    const normalizedCode =
      normalizePromotionCode(promotionCode);

    const validation = validatePromotion(
      normalizedCode,
      subtotal,
    );

    setFeedbackMessage(validation.message);
    setHasError(!validation.isValid);

    if (!validation.isValid) {
      return;
    }

    applyPromotionCode(normalizedCode);
    setPromotionCode(normalizedCode);
  }

  function handleRemovePromotion() {
    removePromotionCode();
    setPromotionCode("");
    setFeedbackMessage("Coupon removed.");
    setHasError(false);
  }

  if (
    appliedPromotionCode &&
    activeValidation?.isValid
  ) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                {appliedPromotionCode} applied
              </p>

              <p className="mt-1 text-sm">
                {
                  activeValidation.promotion
                    ?.description
                }
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove coupon"
            onClick={handleRemovePromotion}
            className="shrink-0 text-green-800 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="promotion-code"
        className="text-sm font-medium"
      >
        Coupon code
      </label>

      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <TicketPercent
            aria-hidden="true"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />

          <input
            id="promotion-code"
            value={promotionCode}
            onChange={(event) => {
              setPromotionCode(event.target.value);
              setFeedbackMessage("");
              setHasError(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApplyPromotion();
              }
            }}
            placeholder="HOTLAP10"
            autoComplete="off"
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-10 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleApplyPromotion}
        >
          Apply
        </Button>
      </div>

      {feedbackMessage && (
        <p
          className={`mt-2 text-sm ${
            hasError
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {feedbackMessage}
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Try HOTLAP10 or RC500 during development.
      </p>
    </div>
  );
}