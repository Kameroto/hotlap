import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  cn,
} from "@/lib/utils";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number;
  currency: "INR";

  size?:
    | "default"
    | "large";
};

export default function ProductPrice({
  price,
  compareAtPrice,
  currency,
  size = "default",
}: ProductPriceProps) {
  const isDiscounted =
    compareAtPrice !==
      undefined &&
    compareAtPrice > price;

  const discountPercentage =
    isDiscounted &&
    compareAtPrice
      ? Math.round(
          ((compareAtPrice -
            price) /
            compareAtPrice) *
            100,
        )
      : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span
        className={cn(
          "font-bold tracking-[-0.025em] text-foreground",

          size === "large"
            ? "text-3xl sm:text-4xl"
            : "text-xl",
        )}
      >
        {formatCurrency(
          price,
          currency,
        )}
      </span>

      {isDiscounted && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",

              size === "large"
                ? "text-[1rem] sm:text-lg"
                : "text-[0.875rem]",
            )}
          >
            {formatCurrency(
              compareAtPrice,
              currency,
            )}
          </span>

          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 text-xs font-bold text-emerald-400">
            {discountPercentage}%
            OFF
          </span>
        </>
      )}
    </div>
  );
}
