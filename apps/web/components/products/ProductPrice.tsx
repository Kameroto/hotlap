import { formatCurrency } from "@/lib/format-currency";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number;
  currency: "INR";
};

export default function ProductPrice({
  price,
  compareAtPrice,
  currency,
}: ProductPriceProps) {
  const isDiscounted =
    compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xl font-bold text-foreground">
        {formatCurrency(price, currency)}
      </span>

      {isDiscounted && (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(compareAtPrice, currency)}
        </span>
      )}
    </div>
  );
}