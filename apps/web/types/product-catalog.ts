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

export type ProductCatalogueQuery = {
  search?: string;
  category?: string;
  sort?: ProductSortOption;
  page?: number;
};

export const DEFAULT_PRODUCT_SORT:
  ProductSortOption =
  "featured";

export const DEFAULT_PRODUCT_PAGE =
  1;

export const PRODUCT_PAGE_SIZE =
  12;

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

export function isProductSortOption(
  value: string,
): value is ProductSortOption {
  return sortOptions.some(
    (option) =>
      option.value === value,
  );
}

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