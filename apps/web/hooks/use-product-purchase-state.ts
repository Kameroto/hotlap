"use client";

import {
  getProductPurchaseState,
} from "@/lib/product-purchase-state";

import {
  useCartStore,
} from "@/store/cart-store";

export function useProductPurchaseState({
  productId,
  stockQuantity,
  lowStockThreshold = 0,
}: {
  productId: string;
  stockQuantity: number;
  lowStockThreshold?: number;
}) {
  const cartQuantity =
    useCartStore(
      (state) =>
        state.cart?.items.find(
          (item) =>
            item.product.id ===
            productId,
        )?.quantity ?? 0,
    );

  return getProductPurchaseState({
    stockQuantity,
    lowStockThreshold,
    cartQuantity,
  });
}
