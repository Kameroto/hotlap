"use client";

import {
  Check,
  LoaderCircle,
  ShoppingCart,
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
  ApiClientError,
} from "@/lib/api/client";

import {
  getProductPurchaseState,
} from "@/lib/product-purchase-state";

import {
  useCartStore,
} from "@/store/cart-store";

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  stockQuantity: number;
  className?: string;
  size?:
    | "default"
    | "sm"
    | "lg";
};

export default function AddToCartButton({
  productId,
  productName,
  stockQuantity,
  className,
  size = "default",
}: AddToCartButtonProps) {
  const actionIsInFlight =
    useRef(false);

  const [
    actionIsPending,
    setActionIsPending,
  ] = useState(false);

  const cart =
    useCartStore(
      (state) =>
        state.cart,
    );

  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
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

  const productIsPending =
    useCartStore(
      (state) =>
        state.pendingProductIds.includes(
          productId,
        ),
    );

  const loadStatus =
    useCartStore(
      (state) =>
        state.loadStatus,
    );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const cartItem =
    cart?.items.find(
      (item) =>
        item.product.id ===
        productId,
    );

  const purchaseState =
    useProductPurchaseState({
      productId,
      stockQuantity,
    });

  const isInCart =
    Boolean(cartItem);

  async function handleAddToCart() {
    if (
      actionIsInFlight.current
    ) {
      return;
    }

    const currentCartState =
      useCartStore.getState();

    if (
      !currentCartState.hasHydrated ||
      currentCartState.isLoading ||
      currentCartState.isReconciling ||
      currentCartState.loadStatus !==
        "loaded" ||
      currentCartState.pendingProductIds.includes(
        productId,
      )
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
      currentPurchaseState.isOutOfStock
    ) {
      toast.error(
        `${productName} is currently unavailable.`,
      );

      return;
    }

    if (
      currentPurchaseState.hasReachedStockLimit
    ) {
      toast.warning(
        `Only ${stockQuantity} units of ${productName} are available.`,
      );

      return;
    }

    actionIsInFlight.current =
      true;
    setActionIsPending(true);

    try {
      const itemWasAdded =
        await addItem(
          productId,
          1,
        );

      if (!itemWasAdded) {
        return;
      }

      toast.success(
        `${productName} added to your cart.`,
        {
          action: {
            label:
              "View Cart",

            onClick: () => {
              window.location.href =
                "/cart";
            },
          },
        },
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to add this product to your cart.";

      toast.error(
        message,
      );
    } finally {
      actionIsInFlight.current =
        false;
      setActionIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={
        !hasHydrated ||
        isLoading ||
        isReconciling ||
        loadStatus !== "loaded" ||
        productIsPending ||
        actionIsPending ||
        !purchaseState.canAddToCart
      }
      onClick={() => {
        void handleAddToCart();
      }}
      aria-label={`Add ${productName} to cart`}
      aria-busy={
        actionIsPending ||
        productIsPending
      }
      className={
        className
      }
    >
      {actionIsPending || productIsPending ? (
        <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
      ) : isInCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}

      {purchaseState.isOutOfStock
        ? "Unavailable"
        : purchaseState.hasReachedStockLimit
          ? "Stock Limit Reached"
          : actionIsPending || productIsPending
            ? "Updating..."
            : isInCart
              ? `In Cart (${cartItem?.quantity ?? 0})`
              : "Add to Cart"}
    </Button>
  );
}
