"use client";

import { useMemo, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import ProductCategoryFilter from "@/components/products/ProductCategoryFilter";
import ProductSearch from "@/components/products/ProductSearch";
import ProductSort from "@/components/products/ProductSort";
import type { Product } from "@/types/product";
import type {
  ProductCategoryFilter as ProductCategoryFilterValue,
  ProductSortOption,
} from "@/types/product-catalog";

type ProductCatalogProps = {
  products: Product[];
};

function sortProducts(
  products: Product[],
  sortOption: ProductSortOption,
): Product[] {
  const sortedProducts = [...products];

  switch (sortOption) {
    case "newest":
      return sortedProducts.sort(
        (firstProduct, secondProduct) => {
          const firstIsNew = firstProduct.badges.includes(
            "new",
          )
            ? 1
            : 0;

          const secondIsNew =
            secondProduct.badges.includes("new")
              ? 1
              : 0;

          if (firstIsNew !== secondIsNew) {
            return secondIsNew - firstIsNew;
          }

          return firstProduct.name.localeCompare(
            secondProduct.name,
          );
        },
      );

    case "price-low-high":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          firstProduct.price - secondProduct.price,
      );

    case "price-high-low":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          secondProduct.price - firstProduct.price,
      );

    case "highest-rated":
      return sortedProducts.sort(
        (firstProduct, secondProduct) => {
          if (
            secondProduct.rating !== firstProduct.rating
          ) {
            return (
              secondProduct.rating - firstProduct.rating
            );
          }

          return (
            secondProduct.reviewCount -
            firstProduct.reviewCount
          );
        },
      );

    case "alphabetical":
      return sortedProducts.sort(
        (firstProduct, secondProduct) =>
          firstProduct.name.localeCompare(
            secondProduct.name,
          ),
      );

    case "featured":
    default:
      return sortedProducts.sort(
        (firstProduct, secondProduct) => {
          const featuredDifference =
            Number(secondProduct.featured) -
            Number(firstProduct.featured);

          if (featuredDifference !== 0) {
            return featuredDifference;
          }

          return firstProduct.name.localeCompare(
            secondProduct.name,
          );
        },
      );
  }
}

export default function ProductCatalog({
  products,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategoryFilterValue>("all");
  const [sortOption, setSortOption] =
    useState<ProductSortOption>("featured");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    const filteredProducts = products.filter(
      (product) => {
        const searchableText = [
          product.name,
          product.brand,
          product.shortDescription,
          product.category,
          product.sku,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedQuery.length === 0 ||
          searchableText.includes(normalizedQuery);

        const matchesCategory =
          selectedCategory === "all" ||
          product.category === selectedCategory;

        return matchesSearch && matchesCategory;
      },
    );

    return sortProducts(
      filteredProducts,
      sortOption,
    );
  }, [
    products,
    searchQuery,
    selectedCategory,
    sortOption,
  ]);

  const filtersAreActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "all" ||
    sortOption !== "featured";

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortOption("featured");
  }

  return (
    <div className="mt-10">
      <ProductSearch
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <ProductCategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="mt-8 flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1
            ? "product"
            : "products"}{" "}
          found
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {filtersAreActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear filters
            </button>
          )}

          <ProductSort
            value={sortOption}
            onChange={setSortOption}
          />
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">
            No matching products
          </h2>

          <p className="mt-2 text-muted-foreground">
            Try a different search term, category, or
            sorting option.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}