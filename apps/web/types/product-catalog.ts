import type { ProductCategory } from "@/types/product";

export type ProductCategoryFilter = "all" | ProductCategory;

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-low-high"
  | "price-high-low"
  | "highest-rated"
  | "alphabetical";

export const categoryOptions: {
  value: ProductCategoryFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "rc-cars", label: "RC Cars" },
  { value: "spare-parts", label: "Spare Parts" },
  { value: "batteries-chargers", label: "Batteries" },
  { value: "electronics", label: "Electronics" },
  { value: "wheels-tires", label: "Wheels" },
  {
    value: "3d-printed-accessories",
    label: "3D Printed",
  },
  { value: "merchandise", label: "Merchandise" },
];

export const sortOptions: {
  value: ProductSortOption;
  label: string;
}[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  {
    value: "price-low-high",
    label: "Price: Low to High",
  },
  {
    value: "price-high-low",
    label: "Price: High to Low",
  },
  {
    value: "highest-rated",
    label: "Highest Rated",
  },
  {
    value: "alphabetical",
    label: "Alphabetical",
  },
];