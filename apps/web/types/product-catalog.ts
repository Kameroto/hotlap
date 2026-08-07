export type ProductCategoryFilter =
  | "all"
  | string;

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-low-high"
  | "price-high-low"
  | "highest-rated"
  | "alphabetical";

export const sortOptions: {
  value: ProductSortOption;
  label: string;
}[] = [
  {
    value: "featured",
    label: "Featured",
  },
  {
    value: "newest",
    label: "Newest",
  },
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

export function mapProductSortToApi(
  sortOption: ProductSortOption,
):
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name" {
  switch (sortOption) {
    case "newest":
      return "newest";

    case "price-low-high":
      return "price-asc";

    case "price-high-low":
      return "price-desc";

    case "highest-rated":
      return "rating";

    case "alphabetical":
      return "name";

    case "featured":
    default:
      return "featured";
  }
}