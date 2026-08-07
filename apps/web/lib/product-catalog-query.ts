import {
  DEFAULT_PRODUCT_PAGE,
  DEFAULT_PRODUCT_SORT,
  isProductSortOption,
  type ProductCatalogueQuery,
  type ProductSortOption,
} from "@/types/product-catalog";

type SearchParamValue =
  | string
  | string[]
  | undefined;

type ProductSearchParams = Record<
  string,
  SearchParamValue
>;

function getFirstValue(
  value: SearchParamValue,
): string | undefined {
  if (
    Array.isArray(value)
  ) {
    return value[0];
  }

  return value;
}

function normalizeOptionalValue(
  value: SearchParamValue,
): string | undefined {
  const firstValue =
    getFirstValue(value);

  const normalizedValue =
    firstValue?.trim();

  return normalizedValue
    ? normalizedValue
    : undefined;
}

function parsePage(
  value: SearchParamValue,
): number {
  const normalizedValue =
    normalizeOptionalValue(
      value,
    );

  if (!normalizedValue) {
    return DEFAULT_PRODUCT_PAGE;
  }

  const parsedPage =
    Number.parseInt(
      normalizedValue,
      10,
    );

  if (
    !Number.isFinite(
      parsedPage,
    ) ||
    parsedPage < 1
  ) {
    return DEFAULT_PRODUCT_PAGE;
  }

  return parsedPage;
}

function parseSort(
  value: SearchParamValue,
): ProductSortOption {
  const normalizedValue =
    normalizeOptionalValue(
      value,
    );

  if (
    normalizedValue &&
    isProductSortOption(
      normalizedValue,
    )
  ) {
    return normalizedValue;
  }

  return DEFAULT_PRODUCT_SORT;
}

export function parseProductCatalogueQuery(
  searchParams: ProductSearchParams,
): ProductCatalogueQuery {
  return {
    search:
      normalizeOptionalValue(
        searchParams.search,
      ),

    category:
      normalizeOptionalValue(
        searchParams.category,
      ),

    sort:
      parseSort(
        searchParams.sort,
      ),

    page:
      parsePage(
        searchParams.page,
      ),
  };
}

export function buildProductCatalogueUrl({
  search,
  category,
  sort,
  page,
}: ProductCatalogueQuery): string {
  const searchParams =
    new URLSearchParams();

  if (search?.trim()) {
    searchParams.set(
      "search",
      search.trim(),
    );
  }

  if (category?.trim()) {
    searchParams.set(
      "category",
      category.trim(),
    );
  }

  if (
    sort &&
    sort !==
      DEFAULT_PRODUCT_SORT
  ) {
    searchParams.set(
      "sort",
      sort,
    );
  }

  if (
    page &&
    page >
      DEFAULT_PRODUCT_PAGE
  ) {
    searchParams.set(
      "page",
      String(page),
    );
  }

  const queryString =
    searchParams.toString();

  return queryString
    ? `/products?${queryString}`
    : "/products";
}