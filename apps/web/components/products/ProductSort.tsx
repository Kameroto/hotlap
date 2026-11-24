"use client";

import {
  DEFAULT_PRODUCT_SORT,
  sortOptions,
  type ProductSortOption,
} from "@/types/product-catalog";

type ProductSortProps = {
  onSelect: (sort?: ProductSortOption) => void;
  value:
    ProductSortOption;
};

export default function ProductSort({
  onSelect,
  value,
}: ProductSortProps) {
  function handleSortChange(nextSort: ProductSortOption) {
    onSelect(nextSort === DEFAULT_PRODUCT_SORT ? undefined : nextSort);
  }

  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <label
        htmlFor="product-sort"
        className="text-sm font-medium"
      >
        Sort by
      </label>

      <select
        id="product-sort"
        value={value}
        onChange={(
          event,
        ) =>
          handleSortChange(
            event.target
              .value as ProductSortOption,
          )
        }
        className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0b0e11] px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none sm:min-w-52"
      >
        {sortOptions.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>
    </div>
  );
}
