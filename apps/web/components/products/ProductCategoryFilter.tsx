"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type {
  ProductCategoryFilter as ProductCategoryFilterValue,
} from "@/types/product-catalog";

type CategoryOption = {
  value: string;
  label: string;
};

type ProductCategoryFilterProps = {
  categories: CategoryOption[];

  selectedCategory:
    ProductCategoryFilterValue;
};

export default function ProductCategoryFilter({
  categories,
  selectedCategory,
}: ProductCategoryFilterProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function updateCategory(
    category:
      ProductCategoryFilterValue,
  ) {
    const nextSearchParams =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      category === "all"
    ) {
      nextSearchParams.delete(
        "category",
      );
    } else {
      nextSearchParams.set(
        "category",
        category,
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
    <div
      className="mt-6 flex flex-wrap gap-3"
      aria-label="Product categories"
    >
      <button
        type="button"
        onClick={() =>
          updateCategory(
            "all",
          )
        }
        aria-pressed={
          selectedCategory ===
          "all"
        }
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          selectedCategory ===
          "all"
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-muted"
        }`}
      >
        All
      </button>

      {categories.map(
        (category) => {
          const isSelected =
            selectedCategory ===
            category.value;

          return (
            <button
              key={
                category.value
              }
              type="button"
              onClick={() =>
                updateCategory(
                  category.value,
                )
              }
              aria-pressed={
                isSelected
              }
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {
                category.label
              }
            </button>
          );
        },
      )}
    </div>
  );
}