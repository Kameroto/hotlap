"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  DEFAULT_PRODUCT_SORT,
  sortOptions,
  type ProductSortOption,
} from "@/types/product-catalog";

type ProductSortProps = {
  value:
    ProductSortOption;
};

export default function ProductSort({
  value,
}: ProductSortProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function handleSortChange(
    nextSort:
      ProductSortOption,
  ) {
    const nextSearchParams =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      nextSort ===
      DEFAULT_PRODUCT_SORT
    ) {
      nextSearchParams.delete(
        "sort",
      );
    } else {
      nextSearchParams.set(
        "sort",
        nextSort,
      );
    }

    nextSearchParams.delete(
      "page",
    );

    const queryString =
      nextSearchParams.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
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
