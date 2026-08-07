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

  onCategoryChange: (
    category:
      ProductCategoryFilterValue,
  ) => void;
};

export default function ProductCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: ProductCategoryFilterProps) {
  return (
    <div
      className="mt-6 flex flex-wrap gap-3"
      aria-label="Product categories"
    >
      <button
        type="button"
        onClick={() =>
          onCategoryChange("all")
        }
        aria-pressed={
          selectedCategory === "all"
        }
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          selectedCategory === "all"
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
              key={category.value}
              type="button"
              onClick={() =>
                onCategoryChange(
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
              {category.label}
            </button>
          );
        },
      )}
    </div>
  );
}