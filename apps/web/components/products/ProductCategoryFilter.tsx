"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  BatteryCharging,
  Boxes,
  CarFront,
  CircleGauge,
  Cog,
  Gamepad2,
  PackageSearch,
  RadioTower,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

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

function getCategoryIcon(
  category: string,
): LucideIcon {
  const normalizedCategory =
    category.toLowerCase();

  if (
    normalizedCategory.includes(
      "rc-car",
    ) ||
    normalizedCategory.includes(
      "car",
    )
  ) {
    return CarFront;
  }

  if (
    normalizedCategory.includes(
      "batter",
    ) ||
    normalizedCategory.includes(
      "charger",
    )
  ) {
    return BatteryCharging;
  }

  if (
    normalizedCategory.includes(
      "3d",
    ) ||
    normalizedCategory.includes(
      "printed",
    )
  ) {
    return Boxes;
  }

  if (
    normalizedCategory.includes(
      "part",
    ) ||
    normalizedCategory.includes(
      "spare",
    )
  ) {
    return Cog;
  }

  if (
    normalizedCategory.includes(
      "tool",
    )
  ) {
    return Wrench;
  }

  if (
    normalizedCategory.includes(
      "radio",
    ) ||
    normalizedCategory.includes(
      "transmitter",
    )
  ) {
    return RadioTower;
  }

  if (
    normalizedCategory.includes(
      "electronic",
    )
  ) {
    return Gamepad2;
  }

  if (
    normalizedCategory.includes(
      "performance",
    )
  ) {
    return CircleGauge;
  }

  if (
    normalizedCategory.includes(
      "merch",
    ) ||
    normalizedCategory.includes(
      "accessor",
    )
  ) {
    return Sparkles;
  }

  return PackageSearch;
}

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
      className="mt-7 flex flex-wrap gap-2.5"
      aria-label="Product categories"
    >
      <CategoryChip
        label="All Items"
        icon={
          PackageSearch
        }
        isSelected={
          selectedCategory ===
          "all"
        }
        onClick={() =>
          updateCategory(
            "all",
          )
        }
      />

      {categories.map(
        (category) => {
          const isSelected =
            selectedCategory ===
            category.value;

          const Icon =
            getCategoryIcon(
              category.value,
            );

          return (
            <CategoryChip
              key={
                category.value
              }
              label={
                category.label
              }
              icon={
                Icon
              }
              isSelected={
                isSelected
              }
              onClick={() =>
                updateCategory(
                  category.value,
                )
              }
            />
          );
        },
      )}
    </div>
  );
}

function CategoryChip({
  label,
  icon: Icon,
  isSelected,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      aria-pressed={
        isSelected
      }
      className={cn(
        "group inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-300",
        isSelected
          ? [
              "border-primary",
              "bg-primary",
              "text-primary-foreground",
              "shadow-[0_8px_26px_rgba(255,106,0,0.18)]",
            ]
          : [
              "border-white/10",
              "bg-white/[0.025]",
              "text-muted-foreground",
              "hover:-translate-y-0.5",
              "hover:border-primary/45",
              "hover:bg-primary/[0.055]",
              "hover:text-foreground",
            ],
      )}
    >
      <Icon
        className={cn(
          "size-4 transition-transform duration-300",
          !isSelected &&
            "text-primary group-hover:scale-110",
        )}
      />

      <span>
        {label}
      </span>
    </button>
  );
}