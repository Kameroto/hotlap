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
        onChange={(
          event,
        ) =>
          handleSortChange(
            event.target
              .value as ProductSortOption,
          )
        }
        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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