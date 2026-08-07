"use client";

import {
  Check,
  LoaderCircle,
  ShoppingCart,
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

  const isOutOfStock =
    stockQuantity <= 0;

  const hasReachedStockLimit =
    cartItem !== undefined &&
    cartItem.quantity >=
      stockQuantity;

  const isInCart =
    Boolean(cartItem);

  async function handleAddToCart() {
    if (
      isOutOfStock
    ) {
      toast.error(
        `${productName} is currently unavailable.`,
      );

      return;
    }

    if (
      hasReachedStockLimit
    ) {
      toast.warning(
        `Only ${stockQuantity} units of ${productName} are available.`,
      );

      return;
    }

    try {
      await addItem(
        productId,
        1,
      );

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
    }
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={
        !hasHydrated ||
        isLoading ||
        isOutOfStock ||
        hasReachedStockLimit
      }
      onClick={() => {
        void handleAddToCart();
      }}
      aria-label={`Add ${productName} to cart`}
      className={
        className
      }
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : isInCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}

      {isOutOfStock
        ? "Unavailable"
        : hasReachedStockLimit
          ? "Stock Limit Reached"
          : isLoading
            ? "Updating..."
            : isInCart
              ? `In Cart (${cartItem?.quantity ?? 0})`
              : "Add to Cart"}
    </Button>
  );
}