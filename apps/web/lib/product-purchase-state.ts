export type ProductPurchaseState = {
  cartQuantity: number;
  remainingQuantity: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  hasReachedStockLimit: boolean;
  canAddToCart: boolean;
};

export function getProductPurchaseState({
  stockQuantity,
  lowStockThreshold = 0,
  cartQuantity = 0,
}: {
  stockQuantity: number;
  lowStockThreshold?: number;
  cartQuantity?: number;
}): ProductPurchaseState {
  const normalizedStockQuantity =
    Math.max(
      0,
      stockQuantity,
    );

  const normalizedCartQuantity =
    Math.max(
      0,
      cartQuantity,
    );

  const isOutOfStock =
    normalizedStockQuantity <=
    0;

  const hasReachedStockLimit =
    !isOutOfStock &&
    normalizedCartQuantity >=
      normalizedStockQuantity;

  return {
    cartQuantity:
      normalizedCartQuantity,

    remainingQuantity:
      Math.max(
        0,
        normalizedStockQuantity -
          normalizedCartQuantity,
      ),

    isOutOfStock,

    isLowStock:
      !isOutOfStock &&
      !hasReachedStockLimit &&
      Math.max(
        0,
        normalizedStockQuantity -
          normalizedCartQuantity,
      ) <= lowStockThreshold,

    hasReachedStockLimit,

    canAddToCart:
      !isOutOfStock &&
      !hasReachedStockLimit,
  };
}

// The cart API caps each addition at 99; cumulative quantity is bounded by inventory.
export const MAX_CART_ADDITION = 99;

export function getMaximumProductAddition(stockQuantity: number, cartQuantity: number) {
  return Math.min(MAX_CART_ADDITION, getProductPurchaseState({ stockQuantity, cartQuantity }).remainingQuantity);
}

export function parseProductQuantity(value: string, maximum: number): number | null {
  if (!/^\d+$/.test(value)) return null;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= maximum ? quantity : null;
}
