import {
  sortOptions,
  type ProductSortOption,
} from "@/types/product-catalog";

type ProductSortProps = {
  value: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
};

export default function ProductSort({
  value,
  onChange,
}: ProductSortProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="product-sort"
        className="text-sm font-medium"
      >
        Sort by
      </label>

      <select
        id="product-sort"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value as ProductSortOption,
          )
        }
        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}