import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

type ProductAvailabilityProps = {
  stockQuantity: number;
  lowStockThreshold: number;
};

export default function ProductAvailability({
  stockQuantity,
  lowStockThreshold,
}: ProductAvailabilityProps) {
  if (stockQuantity <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/8 px-3 py-1.5 text-xs font-semibold text-red-400">
        <XCircle className="size-3.5" />

        Out of Stock
      </div>
    );
  }

  const isLowStock =
    stockQuantity <=
    lowStockThreshold;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",

        isLowStock
          ? "border-amber-500/25 bg-amber-500/8 text-amber-400"
          : "border-emerald-500/25 bg-emerald-500/8 text-emerald-400",
      )}
    >
      {isLowStock ? (
        <AlertTriangle className="size-3.5" />
      ) : (
        <CheckCircle2 className="size-3.5" />
      )}

      {isLowStock
        ? `Only ${stockQuantity} left`
        : "In Stock"}
    </div>
  );
}