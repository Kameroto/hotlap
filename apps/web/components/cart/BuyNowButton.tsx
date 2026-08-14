"use client";

import {
  ArrowRight,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  useProductPurchaseState,
} from "@/hooks/use-product-purchase-state";

import {
  getProductPurchaseState,
} from "@/lib/product-purchase-state";

import {
  useCartStore,
} from "@/store/cart-store";

type BuyNowButtonProps = {
  productId: string;
  productSlug: string;
  productName: string;
  stockQuantity: number;
  className?: string;
  size?:
    | "default"
    | "sm"
    | "lg"
    | "xl";
};

export default function BuyNowButton({
  productId,
  productSlug,
  productName,
  stockQuantity,
  className,
  size = "default",
}: BuyNowButtonProps) {
  const actionIsInFlight =
    useRef(false);

  const [
    actionIsPending,
    setActionIsPending,
  ] = useState(false);

  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const cartIsLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const purchaseState =
    useProductPurchaseState({
      productId,
      stockQuantity,
    });

  function handleBuyNow() {
    if (
      actionIsInFlight.current
    ) {
      return;
    }

    const currentCartState =
      useCartStore.getState();

    if (
      !currentCartState.hasHydrated ||
      currentCartState.isLoading
    ) {
      return;
    }

    const currentCartItem =
      currentCartState.cart?.items.find(
        (item) =>
          item.product.id ===
          productId,
      );

    const currentPurchaseState =
      getProductPurchaseState({
        stockQuantity,
        cartQuantity:
          currentCartItem?.quantity ??
          0,
      });

    if (
      !currentPurchaseState.canAddToCart
    ) {
      toast.warning(
        currentPurchaseState.isOutOfStock
          ? `${productName} is currently unavailable.`
          : `Only ${stockQuantity} units of ${productName} are available.`,
      );

      return;
    }

    actionIsInFlight.current =
      true;
    setActionIsPending(true);

    window.location.assign(
      `/checkout?buyNow=${encodeURIComponent(
        productSlug,
      )}`,
    );
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={
        !hasHydrated ||
        cartIsLoading ||
        actionIsPending ||
        !purchaseState.canAddToCart
      }
      onClick={() => {
        void handleBuyNow();
      }}
      aria-label={`Buy ${productName} now`}
      className={
        className
      }
    >
      <ArrowRight className="size-4 transition-transform duration-300 motion-reduce:transition-none group-hover/button:translate-x-1" />

      {purchaseState.isOutOfStock
        ? "Unavailable"
        : purchaseState.hasReachedStockLimit
          ? "Stock Limit Reached"
          : actionIsPending
            ? "Opening..."
            : cartIsLoading
              ? "Updating..."
            : "Buy Now"}
    </Button>
  );
}
