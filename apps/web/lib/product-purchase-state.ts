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
