"use client";

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  useProductPurchaseState,
} from "@/hooks/use-product-purchase-state";

import {
  cn,
} from "@/lib/utils";

type ProductAvailabilityProps = {
  productId: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

export default function ProductAvailability({
  productId,
  stockQuantity,
  lowStockThreshold,
}: ProductAvailabilityProps) {
  const purchaseState =
    useProductPurchaseState({
      productId,
      stockQuantity,
      lowStockThreshold,
    });

  if (
    purchaseState.isOutOfStock
  ) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-xs font-semibold text-red-400">
        <XCircle className="size-3.5" />

        Out of Stock
      </div>
    );
  }

  if (
    purchaseState.hasReachedStockLimit
  ) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
        <CheckCircle2 className="size-3.5" />

        Maximum in Cart
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",

        purchaseState.isLowStock
          ? "border-amber-500/25 bg-amber-500/8 text-amber-400"
          : "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
      )}
    >
      {purchaseState.isLowStock ? (
        <AlertTriangle className="size-3.5" />
      ) : (
        <CheckCircle2 className="size-3.5" />
      )}

      {purchaseState.isLowStock
        ? `Only ${purchaseState.remainingQuantity} left`
        : "In Stock"}
    </div>
  );
}
