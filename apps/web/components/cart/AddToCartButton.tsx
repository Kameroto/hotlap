"use client";

import {
  Check,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  stockQuantity: number;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export default function AddToCartButton({
  productId,
  productName,
  stockQuantity,
  className,
  size = "default",
}: AddToCartButtonProps) {
  const items = useCartStore(
    (state) => state.items,
  );

  const hasHydrated = useCartStore(
    (state) => state.hasHydrated,
  );

  const addItem = useCartStore(
    (state) => state.addItem,
  );

  const cartItem = items.find(
    (item) => item.productId === productId,
  );

  const isOutOfStock =
    stockQuantity <= 0;

  const hasReachedStockLimit =
    cartItem !== undefined &&
    cartItem.quantity >= stockQuantity;

  const isInCart =
    hasHydrated && cartItem !== undefined;

  function handleAddToCart() {
    if (isOutOfStock) {
      toast.error(
        `${productName} is currently unavailable.`,
      );

      return;
    }

    if (hasReachedStockLimit) {
      toast.warning(
        `Only ${stockQuantity} units of ${productName} are available.`,
      );

      return;
    }

    addItem(
      productId,
      stockQuantity,
    );

    toast.success(
      `${productName} added to your cart.`,
      {
        action: {
          label: "View Cart",
          onClick: () => {
            window.location.href = "/cart";
          },
        },
      },
    );
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={
        !hasHydrated ||
        isOutOfStock ||
        hasReachedStockLimit
      }
      onClick={handleAddToCart}
      aria-label={`Add ${productName} to cart`}
      className={className}
    >
      {isInCart ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}

      {isOutOfStock
        ? "Unavailable"
        : hasReachedStockLimit
          ? "Stock Limit Reached"
          : isInCart
            ? `In Cart (${cartItem.quantity})`
            : "Add to Cart"}
    </Button>
  );
}